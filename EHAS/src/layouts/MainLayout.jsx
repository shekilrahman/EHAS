import { Outlet, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography, theme, Divider } from 'antd';
import { 
  FileSearchOutlined, 
  TeamOutlined, 
  HomeOutlined, 
  TableOutlined 
} from '@ant-design/icons';
import { PiStudent } from 'react-icons/pi';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const MainLayout = () => {
  const {
    token: { 
      colorBgContainer, 
      colorPrimary, 
      borderRadiusLG, 
      boxShadow,
      colorTextLightSolid,
      fontSizeLG,
      fontWeightStrong,
      marginMD,
      marginXS,
      paddingMD,
      paddingSM,
      colorBorderSecondary
    }
  } = theme.useToken();
  
  const location = useLocation();
  const currentPath = location.pathname.split('/')[1] || 'exams';
  
  // Style variables
  const styles = {
    layout: {
      minHeight: '100vh'
    },
    sider: {
      boxShadow: boxShadow,
      zIndex: 999
    },
    logo: { 
      margin: marginMD, 
      textAlign: 'center',
      color: colorTextLightSolid,
      fontSize: fontSizeLG,
      fontWeight: fontWeightStrong
    },
    divider: {
      borderColor: 'rgba(255,255,255,0.1)', 
      margin: `0 0 ${marginXS}px 0`
    },
    menu: {
      borderRight: 0
    },
    header: { 
      padding: `0 ${paddingMD}px`, 
      background: colorBgContainer,
      boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    headerTitle: {
      margin: 0
    },
    content: { 
      margin: paddingMD, 
      display: 'flex', 
      flexDirection: 'column', 
      height: 'calc(100% - 64px)'
    },
    contentContainer: { 
      padding: paddingMD, 
      background: colorBgContainer,
      borderRadius: borderRadiusLG,
      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      flex: 1,
      overflow: 'auto'
    }
  };
  
  const menuItems = [
    { 
      key: 'exams', 
      icon: <FileSearchOutlined />, 
      label: <Link to="/exams">Exams</Link> 
    },
    { 
      key: 'staff', 
      icon: <TeamOutlined />, 
      label: <Link to="/staff">Staff</Link> 
    },
    { 
      key: 'student', 
      icon: <PiStudent />, 
      label: <Link to="/student">Students</Link> 
    },
    { 
      key: 'room', 
      icon: <HomeOutlined />, 
      label: <Link to="/room">Rooms</Link> 
    },
    { 
      key: 'seating-arrangement', 
      icon: <TableOutlined />, 
      label: <Link to="/seating-arrangement">Seat</Link> 
    },
  ];

  // Get page title based on current path
  const getPageTitle = () => {
    const item = menuItems.find(item => item.key === currentPath);
    return item ? item.label.props.children : 'Dashboard';
  };

  return (
    <Layout style={styles.layout}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        style={styles.sider}
      >
        <div className="logo" style={styles.logo}>
          EHAS
        </div>
        <Divider style={styles.divider} />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentPath]}
          items={menuItems}
          style={styles.menu}
        />
      </Sider>
      <Layout>
        <Header style={styles.header}>
          <Title level={4} style={styles.headerTitle}>{getPageTitle()}</Title>
        </Header>
        <Content style={styles.content}>
          <div style={styles.contentContainer}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;