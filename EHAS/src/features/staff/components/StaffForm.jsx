import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, message, Spin, theme } from 'antd';
import { createStaff, updateStaff } from '../../../services/staffAPI';

const StaffForm = ({ open, onClose, initialValues = null, onCreated, title }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  const {
    token: { 
      colorBgContainer,
      colorPrimary,
      borderRadiusLG
    }
  } = theme.useToken();
  
  // Reset form fields when modal opens
  useEffect(() => {
    if (open) {
      form.resetFields();
      
      // If editing, populate the form with initial values
      if (initialValues) {
        form.setFieldsValue(initialValues);
      }
    }
  }, [form, initialValues, open]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...dataToSubmit } = values;
      
      if (initialValues && initialValues._id) {
        // Update existing staff
        const updatedStaff = await updateStaff(initialValues._id, dataToSubmit);
        if (updatedStaff) {
          message.success("Staff updated successfully!");
          form.resetFields();
          onClose();
          if (onCreated) onCreated(updatedStaff);
        } else {
          message.error("Failed to update staff.");
        }
      } else {
        // Create new staff
        const newStaff = await createStaff(dataToSubmit);
        if (newStaff) {
          message.success("Staff created successfully!");
          form.resetFields();
          onClose();
          if (onCreated) onCreated(newStaff);
        } else {
          message.error("Failed to create staff.");
        }
      }
    } catch (error) {
      console.error("Error saving staff:", error);
      message.error("Error saving staff.");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    form: {
      maxWidth: '100%',
      marginTop: 16
    },
    formItem: {
      marginBottom: 16
    }
  };

  return (
    <Modal
      title={title || (initialValues ? "Edit Staff" : "Add New Staff")}
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={() => form.submit()}
      okText={initialValues ? "Update" : "Create"}
      destroyOnClose
      confirmLoading={loading}
    >
      <Spin spinning={loading}>
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={onFinish}
          style={styles.form}
        >
          <Form.Item
            name="staff_id"
            label="Staff ID"
            rules={[
              { required: true, message: 'Please input staff ID!' },
              { pattern: /^[A-Z0-9-]+$/, message: 'Staff ID should contain only uppercase letters, numbers and hyphens' }
            ]}
            style={styles.formItem}
          >
            <Input placeholder="EX: STAFF-001" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please input full name!' }]}
            style={styles.formItem}
          >
            <Input placeholder="John Doe" />
          </Form.Item>

          <Form.Item
            name="department"
            label="Department"
            rules={[{ required: true, message: 'Please select department!' }]}
            style={styles.formItem}
          >
            <Select placeholder="Select a department">
              <Select.Option value="CSE">CSE</Select.Option>
              <Select.Option value="ME">ME</Select.Option>
              <Select.Option value="EEE">EEE</Select.Option>
              <Select.Option value="IT">IT</Select.Option>
              <Select.Option value="ECE">ECE</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: !initialValues, message: 'Please input password!' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
            style={styles.formItem}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>
          
          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              { required: !initialValues, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
            style={styles.formItem}
          >
            <Input.Password placeholder="Confirm password" />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default StaffForm;