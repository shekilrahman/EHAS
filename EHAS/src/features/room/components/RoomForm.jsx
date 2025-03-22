import { Modal, Form, Input, Select, Button, Space, InputNumber, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { createRoom } from '../../../services/roomAPI'; // Adjust the import path as needed

const RoomForm = ({ open, onClose, initialValues }) => {
  const [form] = Form.useForm();

  // Function to compute available columns given a desired count and skip letters.
  const computeAvailableColumns = (numColumns, skipString) => {
    // Parse comma-separated letters (case-insensitive)
    const skipList = skipString
      ? skipString
          .split(',')
          .map((s) => s.trim().toUpperCase())
          .filter(Boolean)
      : [];
    const available = [];
    let letterCode = 65; // Start at 'A'
    while (available.length < numColumns) {
      const letter = String.fromCharCode(letterCode);
      if (!skipList.includes(letter)) {
        available.push(letter);
      }
      letterCode++;
    }
    return available;
  };

  // Function to generate seats using numRows, numColumns, and skipColumns (as letters)
  const handleGenerateSeats = () => {
    const numRows = form.getFieldValue('numRows');
    const numColumns = form.getFieldValue('numColumns');
    const skipColumnsInput = form.getFieldValue('skipColumns');
    if (!numRows || !numColumns || numRows <= 0 || numColumns <= 0) {
      message.error('Please enter a valid number of rows and columns');
      return;
    }
    const availableColumns = computeAvailableColumns(numColumns, skipColumnsInput);
    const seats = [];
    for (let row = 1; row <= numRows; row++) {
      availableColumns.forEach((letter) => {
        seats.push({
          // You can adjust the seat_code format as needed.
          seat_code: letter+row, 
          row: row, 
          column: letter,
          status: 'Available'
        });
      });
    }
    form.setFieldsValue({ seats });
  };

  const onFinish = async (values) => {
    // Remove auto-generation helper fields from submission data.
    const { numRows, numColumns, skipColumns, ...roomData } = values;
    try {
      const newRoom = await createRoom(roomData);
      if (newRoom) {
        message.success('Room created successfully!');
        form.resetFields();
        onClose();
      } else {
        message.error('Failed to create room');
      }
    } catch (error) {
      console.error('Error creating room:', error);
      message.error('Error creating room');
    }
  };

  return (
    <Modal
      title={initialValues ? 'Edit Room' : 'Create Room'}
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={() => form.submit()}
      destroyOnClose
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={onFinish}
      >
        <Form.Item
          name="room_code"
          label="Room Code"
          rules={[{ required: true, message: 'Please input room code!' }]}
        >
          <Input placeholder="EX: ROOM-101" />
        </Form.Item>

        {/* New field for specifying which column letters to skip */}
        <Form.Item
          name="skipColumns"
          label="Skip Columns"
          tooltip="Enter comma-separated letters to skip (e.g., D, G)"
        >
          <Input placeholder="e.g., D, G" />
        </Form.Item>

        {/* Auto-generate seats */}
        <Form.Item label="Auto Generate Seats">
          <Space>
            <Form.Item
              name="numRows"
              noStyle
              rules={[{ required: true, message: 'Enter number of rows' }]}
            >
              <InputNumber placeholder="Rows" min={1} />
            </Form.Item>
            <Form.Item
              name="numColumns"
              noStyle
              rules={[{ required: true, message: 'Enter number of columns' }]}
            >
              <InputNumber placeholder="Columns" min={1} />
            </Form.Item>
            <Button type="primary" onClick={handleGenerateSeats}>
              Generate Seats
            </Button>
          </Space>
        </Form.Item>

        {/* Manual seat list remains unchanged */}
        <Form.List name="seats">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: 'flex', marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={[name, 'seat_code']}
                    label="Seat Code"
                    rules={[{ required: true, message: 'Please input seat code!' }]}
                  >
                    <Input placeholder="EX: A" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'status']}
                    label="Status"
                    rules={[{ required: true, message: 'Please select status!' }]}
                  >
                    <Select placeholder="Select status">
                      <Select.Option value="Available">Available</Select.Option>
                      <Select.Option value="Occupied">Occupied</Select.Option>
                    </Select>
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Seat Manually
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default RoomForm;
