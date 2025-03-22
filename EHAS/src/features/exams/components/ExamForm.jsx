import { Modal, Form, Input, DatePicker, Select, Tag, message } from 'antd';
import dayjs from 'dayjs';
import { createExam } from '../../../services/examAPI';

const ExamForm = ({ open, onClose, initialValues }) => {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const processedValues = {
      ...values,
      date: values.date.toDate(), // Convert to JavaScript Date object
    };
    console.log('Submitted values:', processedValues);
    
    try {
      const result = await createExam(processedValues);
      if (result) {
        message.success('Exam created successfully!');
      } else {
        message.error('Failed to create exam.');
      }
    } catch (error) {
      message.error('An error occurred while creating the exam.');
    }
    onClose();
  };

  return (
    <Modal
      title={initialValues ? 'Edit Exam' : 'Create Exam'}
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
            ? { ...initialValues, date: initialValues.date ? dayjs(initialValues.date) : null }
            : {}
        }
        onFinish={onFinish}
      >
        <Form.Item
          name="course_code"
          label="Course Code"
          rules={[{ required: true, message: 'Please input course code!' }]}
        >
          <Input placeholder="EX: CS101" />
        </Form.Item>

        <Form.Item name="course_name" label="Course Name (Optional)">
          <Input placeholder="EX: Introduction to Computer Science" />
        </Form.Item>

        <Form.Item
          name="date"
          label="Exam Date & Time"
          rules={[{ required: true, message: 'Please select exam date!' }]}
        >
          <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="seating" label="Seating Status" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="not-published">
              <Tag color="red">Not Published</Tag>
            </Select.Option>
            <Select.Option value="published">
              <Tag color="green">Published</Tag>
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="status" label="Exam Status" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="upcoming">
              <Tag color="blue">Upcoming</Tag>
            </Select.Option>
            <Select.Option value="ongoing">
              <Tag color="orange">Ongoing</Tag>
            </Select.Option>
            <Select.Option value="end">
              <Tag color="gray">Ended</Tag>
            </Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ExamForm;
