import React from 'react';
import { Avatar, Icon, Menu, Dropdown, message } from 'antd';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { screen } from '@/constants/screen';
import { apiGet } from '@/utils/request';
import { LOGOUT } from '@/constants/urls';
import Cookies from 'js-cookie';
import { Action } from '@/redux/actions';
import './index.less';
import { SelectParam } from 'antd/lib/menu';

interface OperationProps extends RouteComponentProps {
  dispatch(action: Action): void;
  handleMenuChange(obj: SelectParam | { key: string }): void;
  username?: string;
  avatar?: string | null;
  uid?: string | number;
}

const defaultAvatar = 'https://s1-fs.pstatp.com/static-resource-staging/v1/78c99186-2f3c-40aa-81b8-18591041db2g';

function Operation(props: OperationProps): any {
  const { handleMenuChange, username, avatar, dispatch, uid, history } = props;
  const handleClickItem = () => {
    const obj = {
      key: 'user',
    };
    handleMenuChange(obj);
  };

  // 「退出登录」
  const handleLogout = () => {
    Cookies.remove('token', { path: '/' }); // client删除token
    apiGet(LOGOUT).then(() => {
      message.success('退出成功');
      history.push({ pathname: '/home' });
      dispatch({
        type: 'GET_USERINFO',
        payload: {},
      });
      dispatch({
        type: 'CHANGE_LOGIN_STATE',
        payload: false,
      });
    });
  };

  const menu = (
    <Menu className="user_operation_menu" selectable={false}>
      <Menu.Item key="0" onClick={handleClickItem} className="user_operation_menu_item">
        <Link to={`/user/${uid}`} className="user_operation_menu_item_text">
          个人信息
        </Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="1" className="user_operation_menu_item">
        <div className="user_operation_menu_item_text">修改密码</div>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="2" className="user_operation_menu_item">
        <div className="user_operation_menu_item_text" onClick={handleLogout}>
          退出登录
        </div>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="user_operation">
      <span className="user_operation_nick_name">{username}</span>
      <div className="user_operation_avatar">
        <Avatar
          className={screen.isLittleScreen ? 'user_operation_avatar_img__small' : 'user_operation_avatar_img'}
          icon="user"
          src={avatar || defaultAvatar}
        />
        <Dropdown overlay={menu} trigger={screen.isLittleScreen ? ['click'] : ['hover']}>
          <a
            className="ant-dropdown-link"
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            <Icon type="down" className="user_operation_avatar_icon" />
          </a>
        </Dropdown>
      </div>
    </div>
  );
}

export default withRouter(Operation as any);
