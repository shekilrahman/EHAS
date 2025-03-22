import { useState, useEffect } from 'react';
import { Modal, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Papa from 'papaparse';
import { createStudent } from '../../../services/studentAPI';
import { getStaff } from '../../../services/staffAPI';

const BulkStudentUploadModal = ({ open, onClose, onUploadComplete }) => {
  const [fileList, setFileList] = useState([]);
  const [staffMapping, setStaffMapping] = useState({});

  // Fetch staff list and build mapping: staffCode -> MongoDB _id
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const staffList = await getStaff();
        const mapping = {};
        // Assuming each staff object has a 'staff_id' attribute and '_id'
        staffList.forEach((staff) => {
          mapping[staff.staff_id] = staff._id;
        });
        setStaffMapping(mapping);
      } catch (error) {
        message.error('Failed to fetch staff list.');
      }
    };
    fetchStaff();
  }, []);

  const handleUpload = () => {
    if (fileList.length === 0) {
      message.error('Please select a CSV file first.');
      return;
    }
    const file = fileList[0];
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const { data, errors } = results;
        if (errors.length > 0) {
          message.error('Error parsing CSV file.');
          return;
        }
        // Process each student record
        for (let student of data) {
          // Replace CSV's staff_id with actual MongoDB _id using mapping
          if (student.staff_id) {
            if (staffMapping[student.staff_id]) {
              student.staff_id = staffMapping[student.staff_id];
            } else {
              console.error(`Staff code ${student.staff_id} not found.`);
              message.error(`Staff code ${student.staff_id} not found. Skipping record for ${student.reg_no}.`);
              continue; // Skip this record if staff id not found
            }
          }
          // Convert dob from string to Date object if available
          if (student.dob) {
            student.dob = new Date(student.dob);
          }
          try {
            await createStudent(student);
          } catch (e) {
            console.error('Error creating student', student, e);
          }
        }
        message.success('Bulk upload completed.');
        onUploadComplete();
        onClose();
      },
      error: (error) => {
        message.error(`Error reading file: ${error.message}`);
      },
    });
  };

  const uploadProps = {
    beforeUpload: (file) => {
      setFileList([file]);
      return false; // Prevent automatic upload
    },
    onRemove: () => {
      setFileList([]);
    },
    fileList,
    accept: '.csv',
  };

  return (
    <Modal
      title="Bulk Upload Students"
      open={open}
      onCancel={onClose}
      onOk={handleUpload}
      destroyOnClose
    >
      <p>Please upload a CSV file with the following structure:</p>
      <ul>
        <li><strong>reg_no</strong> (string)</li>
        <li><strong>name</strong> (string)</li>
        <li><strong>roll_no</strong> (number)</li>
        <li><strong>semester</strong> (string, one of S1 to S8)</li>
        <li><strong>staff_id</strong> (string, must match a valid staff id code)</li>
        <li><strong>dob</strong> (date in YYYY-MM-DD format)</li>
        <li><strong>department</strong> (string)</li>
        <li><strong>password</strong> (string)</li>
      </ul>
      <Upload {...uploadProps}>
        <Button icon={<UploadOutlined />}>Select CSV File</Button>
      </Upload>
    </Modal>
  );
};

export default BulkStudentUploadModal;
