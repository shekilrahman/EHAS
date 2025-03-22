import { useState, useEffect } from 'react';
import { Button, Table, Space, Card, Typography, Tag, message, Tooltip, Spin, Empty, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import RoomForm from './components/RoomForm';
import RoomSeatsModal from './components/RoomSeatsModal';
import { getRooms, deleteRoom } from '../../services/roomAPI';

const { Title, Text } = Typography;

const RoomPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [isSeatsModalOpen, setIsSeatsModalOpen] = useState(false);
  const [selectedRoomForSeats, setSelectedRoomForSeats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch room data from the API.
  const fetchRooms = async () => {
    try {
      setRefreshing(true);
      const data = await getRooms();
      setRooms(data);
      message.success('Rooms loaded successfully');
    } catch (error) {
      console.error('Error fetching rooms:', error);
      message.error('Failed to fetch rooms');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreate = () => {
    setSelectedRoom(null);
    setIsModalOpen(true);
  };

  const handleEdit = (room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleDelete = async (room) => {
    try {
      await deleteRoom(room._id);
      message.success(`Room ${room.room_code} deleted successfully`);
      fetchRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
      message.error('Failed to delete room');
    }
  };

  const handleViewSeats = (room) => {
    setSelectedRoomForSeats(room);
    setIsSeatsModalOpen(true);
  };

  // Define table columns.
  const columns = [
    {
      title: 'Room Code',
      dataIndex: 'room_code',
      key: 'room_code',
      sorter: (a, b) => a.room_code.localeCompare(b.room_code),
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Staff',
      dataIndex: 'staff_id',
      key: 'staff_id',
      render: (staff) => (
        staff && staff.name 
          ? <Tag color="blue">{staff.name}</Tag> 
          : <Tag color="red">Not Assigned</Tag>
      ),
    },
    {
      title: 'Seats Count',
      key: 'seatsCount',
      render: (_, record) => {
        const count = record.seats ? record.seats.length : 0;
        return (
          <Tooltip title={`${count} seat${count !== 1 ? 's' : ''} available`}>
            <Tag color={count > 0 ? 'green' : 'orange'}>
              {count} seat{count !== 1 ? 's' : ''}
            </Tag>
          </Tooltip>
        );
      },
      sorter: (a, b) =>
        (a.seats ? a.seats.length : 0) - (b.seats ? b.seats.length : 0),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit room">
            <Button 
              type="primary" 
              ghost 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
              size="middle"
            />
          </Tooltip>
          <Tooltip title="Delete room">
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDelete(record)}
              size="middle"
            />
          </Tooltip>
          <Tooltip title="View seating arrangement">
            <Button 
              type="default" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewSeats(record)}
              size="middle"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Card className="shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} style={{ margin: 0 }}>Room Management</Title>
          <Text type="secondary">Manage classroom rooms and seating arrangements</Text>
        </div>
        <Space>
          <Tooltip title="Refresh room data">
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchRooms} 
              loading={refreshing}
            >
              Refresh
            </Button>
          </Tooltip>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleCreate}
          >
            Add New Room
          </Button>
        </Space>
      </div>

      <Divider />

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" tip="Loading rooms..." />
        </div>
      ) : rooms.length === 0 ? (
        <Empty 
          description="No rooms found" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleCreate}
          >
            Add Your First Room
          </Button>
        </Empty>
      ) : (
        <Table
          columns={columns}
          dataSource={rooms}
          rowKey="_id"
          bordered
          scroll={{ x: 'max-content' }}
          pagination={{
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} rooms`,
            pageSize: 10,
            pageSizeOptions: ['10', '20', '50'],
          }}
          rowClassName="hover:bg-gray-50"
        />
      )}

      <RoomForm
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchRooms();
        }}
        initialValues={selectedRoom}
      />

      <RoomSeatsModal
        room={selectedRoomForSeats}
        open={isSeatsModalOpen}
        onClose={() => setIsSeatsModalOpen(false)}
      />
    </Card>
  );
};

export default RoomPage;