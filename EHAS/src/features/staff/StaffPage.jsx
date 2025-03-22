import { useState, useEffect } from 'react';
import { 
  Button, 
  Table, 
  Space, 
  Card, 
  Typography, 
  message, 
  Input, 
  Tooltip, 
  Popconfirm, 
  Tag, 
  Flex,
  theme 
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ReloadOutlined 
} from '@ant-design/icons';
import StaffForm from './components/StaffForm';
import { getStaff, deleteStaff } from '../../services/staffAPI';

const { Title } = Typography;
const { Search } = Input;

const StaffPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  const {
    token: { 
      colorBgContainer, 
      colorPrimary, 
      borderRadiusLG, 
      colorSuccess,
      colorWarning,
      colorError,
      padding,
      paddingSM,
      paddingLG,
      marginSM,
      marginMD,
      colorBgLayout,
      boxShadow
    }
  } = theme.useToken();
  
  // Style variables
  const styles = {
    card: {
      borderRadius: borderRadiusLG,
      boxShadow: boxShadow
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: marginMD,
      flexWrap: 'wrap',
      gap: paddingSM
    },
    headerLeft: {
      marginBottom: marginSM
    },
    searchBar: {
      width: 250,
      marginRight: marginSM
    },
    table: {
      marginTop: marginMD
    },
    actionButton: {
      marginLeft: paddingSM
    },
    departmentTag: (department) => {
      const colorMap = {
        'Engineering': colorSuccess,
        'Science': colorPrimary,
        'Arts': colorWarning,
        'Management': colorError
      };
      return {
        color: colorMap[department] || colorPrimary,
        backgroundColor: `${colorMap[department]}15` || `${colorPrimary}15`
      };
    }
  };

  // Fetch the staff list from the API
  const fetchStaff = async () => {
    setLoading(true);
    try {
      const data = await getStaff();
      setStaffList(data);
    } catch (error) {
      console.error("Error fetching staff:", error);
      message.error("Failed to fetch staff data");
    } finally {
      setLoading(false);
    }
  };

  // Call fetchStaff on component mount
  useEffect(() => {
    fetchStaff();
  }, []);

  // Filter staff list based on search text
  const filteredStaff = staffList.filter(staff => 
    staff.name.toLowerCase().includes(searchText.toLowerCase()) || 
    staff.staff_id.toString().includes(searchText) ||
    staff.department.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { 
      title: 'Staff ID', 
      dataIndex: 'staff_id', 
      key: 'staff_id',
      sorter: (a, b) => a.staff_id.localeCompare(b.staff_id)
    },
    { 
      title: 'Name', 
      dataIndex: 'name', 
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name) 
    },
    { 
      title: 'Department', 
      dataIndex: 'department', 
      key: 'department',
      render: (department) => (
        <Tag style={styles.departmentTag(department)}>
          {department}
        </Tag>
      ),
      filters: [...new Set(staffList.map(item => item.department))].map(dept => ({
        text: dept,
        value: dept,
      })),
      onFilter: (value, record) => record.department === value
    },
    {
      title: 'Action',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button 
              type="primary" 
              shape="circle" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)} 
              size="middle"
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete staff member"
              description="Are you sure you want to delete this staff member?"
              onConfirm={() => handleDelete(record)}
              okText="Yes"
              cancelText="No"
            >
              <Button 
                type="primary" 
                danger 
                shape="circle" 
                icon={<DeleteOutlined />} 
                size="middle"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleCreate = () => {
    setSelectedStaff(null);
    setIsModalOpen(true);
  };

  const handleEdit = (staff) => {
    setSelectedStaff(staff);
    setIsModalOpen(true);
  };

  const handleDelete = async (staff) => {
    try {
      await deleteStaff(staff._id); // or use staff.staff_id if that's your unique identifier
      message.success("Staff deleted successfully");
      fetchStaff();
    } catch (error) {
      console.error("Error deleting staff:", error);
      message.error("Failed to delete staff");
    }
  };

  // Callback function to refresh the staff list after creating or updating a staff record
  const handleStaffCreatedOrUpdated = () => {
    fetchStaff();
    setIsModalOpen(false);
  };

  return (
    <Card style={styles.card}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Title level={4}>Staff Management</Title>
        </div>
        
        <Flex gap={paddingSM} wrap="wrap">
          <Search
            placeholder="Search staff..."
            onSearch={value => setSearchText(value)}
            onChange={e => setSearchText(e.target.value)}
            style={styles.searchBar}
            allowClear
          />
          
          <Tooltip title="Refresh">
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchStaff}
              loading={loading}
            />
          </Tooltip>
          
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleCreate}
          >
            Add Staff
          </Button>
        </Flex>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={filteredStaff}
        rowKey="staff_id"
        bordered
        style={styles.table}
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} staff members`,
          pageSizeOptions: ['10', '20', '50'],
          defaultPageSize: 10
        }}
      />

      <StaffForm 
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialValues={selectedStaff}
        onCreated={handleStaffCreatedOrUpdated}
        title={selectedStaff ? "Edit Staff Member" : "Add New Staff Member"}
      />
    </Card>
  );
};

export default StaffPage;