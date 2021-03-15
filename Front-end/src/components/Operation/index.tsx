import React, { useState } from 'react';
import { Avatar, Icon, Menu, Dropdown } from 'antd';
import { Link } from 'react-router-dom';
import { screen } from '@/constants/screen';
import { get } from '@/utils/request';
import { LOGOUT } from '@/constants/urls';
import Cookies from 'js-cookie';
import { handleErrorMsg } from '@/utils/handleErrorMsg';
import { Action } from '@/redux/actions';
import './index.less';

interface MenuProps {
  dispatch(action: Action): void;
  handleMenuChange(obj: any): void;
}

interface Props extends MenuProps {
  username?: string;
  avatar?: string | null;
}

const defaultAvatar = 'https://s1-fs.pstatp.com/static-resource-staging/v1/78c99186-2f3c-40aa-81b8-18591041db2g';

export default function Operation(props: Props): any {
  const { handleMenuChange, username, avatar, dispatch } = props;
  const handleClickItem = () => {
    const obj = {
      key: 'user'
    };
    handleMenuChange(obj);
  };

  // 「退出登录」
  const handleLogout = () => {
    Cookies.remove('token', { path: '/' }); // client删除token
    get(LOGOUT).catch(e => {
      dispatch({
        type: 'GET_USERINFO',
        payload: {},
      });
      dispatch({
        type: 'CHANGE_LOGIN_STATE',
        payload: false,
      });
      handleErrorMsg(e);
    });
  };

  const menu = (
    <Menu className="user_operation_menu" selectable={false}>
      <Menu.Item key="0" onClick={handleClickItem} className="user_operation_menu_item">
        <Link to="/user" className="user_operation_menu_item_text">个人信息</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="1" className="user_operation_menu_item">
        <div className="user_operation_menu_item_text">修改密码</div>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="2" className="user_operation_menu_item">
        <div className="user_operation_menu_item_text" onClick={handleLogout}>退出登录</div>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="user_operation">
      <span className="user_operation_nick_name">{username}</span>
      <div className="user_operation_avatar">
        <Avatar className={screen.isLittleScreen ? "user_operation_avatar_img__small" : "user_operation_avatar_img"} icon="user" src={avatar || defaultAvatar}/>
        <Dropdown overlay={menu} trigger={screen.isLittleScreen ? ['click'] : ['hover']}>
          <a className="ant-dropdown-link" onClick={e => {
            e.preventDefault();
          }}>
            <Icon type="down" className="user_operation_avatar_icon"/>
          </a>
        </Dropdown>
      </div>
    </div>
  );
}