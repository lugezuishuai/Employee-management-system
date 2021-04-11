import React, { useState, useEffect, useCallback } from 'react';
import { Menu, Button, Icon, Dropdown } from 'antd';
import { connect } from 'react-redux';
import DropdownMenu from '@/assets/icon/menu.svg';
import Heart from '@/assets/icon/heart.svg';
import { WrapSignUp } from '@/components/signUp';
import Operation from '@/components/Operation';
import { apiGet } from '@/utils/request';
import { UserInfo, InitResponse } from '@/interface/user/init';
import { INIT } from '@/constants/urls';
import { Link } from 'react-router-dom';
import { State } from '@/redux/reducers/state';
import { Action } from '@/redux/actions';
import { screen } from '@/constants/screen';
import { MenuItemType } from '@/components/signUp';
import { Skeleton } from '@/components/Skeleton';
import { WrapWithLogin } from '@/components/with-login';
import { SelectParam } from 'antd/lib/menu';
import { MenuConfig, loginMenu, noLoginMenu } from './menu-config';
import classnames from 'classnames';
import './index.less';

const { Item, Divider } = Menu;

export interface HeaderProps {
  dispatch(action: Action): void;
  selectMenu: string;
  userInfo: UserInfo;
  login: boolean | null;
}

const { Block, InlineBlock, Avatar } = Skeleton;

function UserSkeleton() {
  return screen.isLittleScreen ? (
    <Skeleton className="user-skeleton__mobile">
      <Block className="email-skeleton__mobile" />
      <Avatar className="avatar-skeleton__mobile" />
    </Skeleton>
  ) : (
    <Skeleton className="row-flex" style={{ marginRight: 24 }}>
      <InlineBlock className="email-skeleton" />
      <Avatar className="avatar-skeleton" />
      <InlineBlock className="dropdown-skeleton" />
    </Skeleton>
  );
}

function MenuSkeleton() {
  return (
    <Skeleton className={classnames('row-flex', 'menu-skeleton')}>
      <InlineBlock className="menu-skeleton__item" />
      <InlineBlock className="menu-skeleton__item" />
      <InlineBlock className="menu-skeleton__item" />
      <InlineBlock className="menu-skeleton__item" />
    </Skeleton>
  );
}

function Header(props: HeaderProps) {
  const { selectMenu, dispatch, userInfo, login } = props;
  const { username, avatar, uid } = userInfo;
  const [visible, setVisible] = useState(false);
  const [signUpMenu, setSignUpMenu] = useState<MenuItemType | null>(null);
  const [loading, setLoading] = useState(true);

  function hideModal() {
    setVisible(false);
  }

  function handleClickLogin() {
    setVisible(true);
    setSignUpMenu('login');
  }

  function handleClickRegister() {
    setVisible(true);
    setSignUpMenu('register');
  }

  // 获取初始选中的菜单
  function setInitialMenu() {
    const pathArr = window.location.href.split('/');
    const activeMenu = pathArr[3];
    dispatch({
      type: 'CHANGE_SELECT_MENU',
      payload: activeMenu,
    });
  }

  useEffect(() => {
    apiGet(INIT)
      .then((res: InitResponse) => {
        dispatch({
          type: 'GET_USERINFO',
          payload: {
            ...res.data.userInfo,
            uid: res.data.userInfo.uid && res.data.userInfo.uid.slice(0, 8),
          },
        });
        dispatch({
          type: 'CHANGE_LOGIN_STATE',
          payload: true,
        });
      })
      .catch(() => {
        dispatch({
          type: 'CHANGE_LOGIN_STATE',
          payload: false,
        });
      })
      .finally(() => {
        setLoading(false);
      });
    setInitialMenu();
  }, []);

  function handleMenuChange({ key }: SelectParam | { key: string }) {
    dispatch({
      type: 'CHANGE_SELECT_MENU',
      payload: key,
    });
  }

  function handleBackHome() {
    dispatch({
      type: 'CHANGE_SELECT_MENU',
      payload: '',
    });
  }

  function renderHomeMenu(config: MenuConfig[], isMobile = false) {
    return (
      <Menu
        className={isMobile ? 'little_screen_menu' : 'home_menu'}
        mode={isMobile ? 'vertical' : 'horizontal'}
        selectedKeys={selectMenu ? [selectMenu] : []}
        onSelect={handleMenuChange}
      >
        {isMobile
          ? config.map(({ key, to, text }, index, arr) => {
              return [
                <Item key={key} className="little_screen_menu_item">
                  {typeof to === 'function' ? (
                    <Link to={() => to(uid || '')}>{text}</Link>
                  ) : (
                    <Link to={to}>{text}</Link>
                  )}
                </Item>,
                index !== arr.length - 1 ? <Divider /> : null,
              ];
            })
          : config.map(({ key, to, text }) => {
              return (
                <Item key={key} className="home_menu_item">
                  {typeof to === 'function' ? (
                    <Link to={() => to(uid || '')}>{text}</Link>
                  ) : (
                    <Link to={to}>{text}</Link>
                  )}
                </Item>
              );
            })}
      </Menu>
    );
  }

  const mobileMenu = login ? renderHomeMenu(loginMenu, true) : renderHomeMenu(noLoginMenu, true);

  const renderUserState = useCallback(
    (login: boolean | null) => {
      if (login) {
        return (
          <Operation
            // @ts-ignore
            handleMenuChange={handleMenuChange}
            username={username}
            avatar={avatar}
            uid={uid}
            dispatch={dispatch}
          />
        );
      } else {
        if (screen.isLittleScreen) {
          return (
            <Button type="primary" className="home_user_login__mobile" onClick={handleClickLogin}>
              登录/注册
            </Button>
          );
        } else {
          return (
            <div className="home_user">
              <Button type="primary" className="home_user_login" onClick={handleClickLogin}>
                登录
              </Button>
              <Button className="home_user_login" onClick={handleClickRegister}>
                注册
              </Button>
            </div>
          );
        }
      }
    },
    [login, screen.isLittleScreen]
  );

  return (
    <div className="home_header">
      {screen.isLittleScreen ? (
        <Dropdown overlay={mobileMenu} trigger={['click']}>
          <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
            <Icon component={DropdownMenu as any} className="home_menu_little_icon" />
          </a>
        </Dropdown>
      ) : (
        <WrapWithLogin noLoginPlaceholder={renderHomeMenu(noLoginMenu)} loadingComponent={<MenuSkeleton />}>
          {renderHomeMenu(loginMenu)}
        </WrapWithLogin>
      )}
      <Link to="/" className="back_to_home" onClick={handleBackHome}>
        <Icon component={Heart as any} className="back_to_home_icon" />
        <span className="back_to_home_text">Soul Harbor</span>
      </Link>
      {loading ? <UserSkeleton /> : renderUserState(login)}
      {visible && <WrapSignUp dispatch={dispatch} menu={signUpMenu} visible={visible} hide={hideModal} />}
    </div>
  );
}

export default connect((state: State) => ({
  selectMenu: state.header.selectMenu,
  userInfo: state.user.userInfo,
  login: state.user.login,
}))(Header);
