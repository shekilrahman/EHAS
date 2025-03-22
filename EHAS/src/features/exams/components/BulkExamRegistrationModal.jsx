import { useState } from 'react';
import { Modal, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Papa from 'papaparse';
import { searchStudentByRegNo, registerExamForStudent } from '../../../services/studentAPI';

const BulkExamRegistrationModal = ({ open, onClose, exam }) => {
  const [fileList, setFileList] = useState([]);

  const handleUpload = () => {
    if (fileList.length === 0) {
      message.error('Please select a CSV file first.');
      return;
    }
    const file = fileList[0];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        (async () => {
          const { data, errors } = results;
          if (errors.length > 0) {
            console.error('Parsing errors:', errors);
            message.error('Error parsing CSV file.');
            return;
          }
          // Process each row: get reg_no and register exam for that student.
          for (const row of data) {
            const reg_no = row.reg_no;
            if (!reg_no) continue; // Skip if reg_no is missing.
            try {
              const student = await searchStudentByRegNo(reg_no);
              if (!student) {
                console.error(`Student with reg_no ${reg_no} not found.`);
                message.error(`Student with reg_no ${reg_no} not found.`);
                continue;
              }
              await registerExamForStudent(student._id, [{
                exam_id: exam._id,
                status: 'upcoming'
              }]);
            } catch (e) {
              console.error('Error registering exam for student with reg_no', reg_no, e);
            }
          }
          message.success('Bulk exam registration completed.');
          onClose();
        })();
      },
      error: (error) => {
        message.error(`Error reading file: ${error.message}`);
      },
    });
  };

  const uploadProps = {
    beforeUpload: (file) => {
      setFileList([file]);
      return false; // Prevent automatic upload.
    },
    onRemove: () => {
      setFileList([]);
    },
    fileList,
    accept: '.csv',
  };

  return (
    <Modal
      title={`Bulk Register Students for Exam: ${exam?.course_code || ''}`}
      open={open}
      onCancel={onClose}
      onOk={handleUpload}
      destroyOnClose
    >
      <p>Please upload a CSV file with the following column:</p>
      <ul>
        <li><strong>reg_no</strong> (string)</li>
      </ul>
      <Upload {...uploadProps}>
        <Button icon={<UploadOutlined />}>Select CSV File</Button>
      </Upload>
    </Modal>
  );
};

export default BulkExamRegistrationModal;
