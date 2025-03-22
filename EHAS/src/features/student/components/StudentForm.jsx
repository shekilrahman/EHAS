import { useState, useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select, message } from 'antd';
import dayjs from 'dayjs';
import { createStudent } from '../../../services/studentAPI';
import { getStaff } from '../../../services/staffAPI';

const StudentForm = ({ open, onClose, initialValues }) => {
  const [form] = Form.useForm();
  const [staffOptions, setStaffOptions] = useState([]);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const data = await getStaff();
        setStaffOptions(data);
      } catch (error) {
        message.error('Failed to fetch staff list.');
      }
    };
    fetchStaff();
  }, []);

  const onFinish = async (values) => {
    const processedValues = {
      ...values,
      dob: values.dob.toDate(), // Convert DOB to JavaScript Date object
    };
    console.log('Submitted values:', processedValues);
    
    try {
      const result = await createStudent(processedValues);
      if (result) {
        message.success('Student created successfully!');
      } else {
        message.error('Failed to create student.');
      }
    } catch (error) {
      message.error('An error occurred while creating the student.');
    }
    onClose();
  };

  return (
    <Modal
      title={initialValues ? 'Edit Student' : 'Create Student'}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={
          initialValues
            ? {
                ...initialValues,
                dob: initialValues.dob ? dayjs(initialValues.dob) : null,
              }
            : {}
        }
        onFinish={onFinish}
      >
        <Form.Item
          name="reg_no"
          label="Registration Number"
          rules={[{ required: true, message: 'Please input registration number!' }]}
        >
          <Input placeholder="EX: WYD20CS001" />
        </Form.Item>

        <Form.Item
          name="name"
          label="Student Name"
          rules={[{ required: true, message: 'Please input student name!' }]}
        >
          <Input placeholder="EX: John Doe" />
        </Form.Item>

        <Form.Item
          name="roll_no"
          label="Roll Number"
          rules={[{ required: true, message: 'Please input roll number!' }]}
        >
          <Input type="number" placeholder="EX: 5" />
        </Form.Item>

        <Form.Item
          name="semester"
          label="Semester"
          rules={[{ required: true, message: 'Please select a semester!' }]}
        >
          <Select placeholder="Select Semester">
            {['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'].map((semester) => (
              <Select.Option key={semester} value={semester}>
                {semester}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="staff_id"
          label="Staff"
          rules={[{ required: true, message: 'Please select a staff!' }]}
        >
          <Select placeholder="Select Staff">
            {staffOptions.map((staff) => (
              <Select.Option key={staff._id} value={staff._id}>
                {staff.name || staff.email || staff.staff_id}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="dob"
          label="Date of Birth"
          rules={[{ required: true, message: 'Please select date of birth!' }]}
        >
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item
          name="department"
          label="Department"
          rules={[{ required: true, message: 'Please input department!' }]}
        >
          <Input placeholder="EX: Computer Science" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Please input password!' }]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StudentForm;
