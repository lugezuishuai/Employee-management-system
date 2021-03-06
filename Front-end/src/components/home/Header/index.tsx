import React, { useState, useEffect, useCallback } from 'react';
import { Menu, Button, Icon, Dropdown } from 'antd';
import { connect } from 'react-redux';
import DropdownMenu from '@/assets/icon/menu.svg';
import Heart from '@/assets/icon/heart.svg';
import { WrapSignUp } from '@/components/sign-up';
import { WrapOperation } from '@/components/operation';
import { apiGet } from '@/utils/request';
import { UserInfo } from '@/interface/user/init';
import { INIT } from '@/constants/urls';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { State } from '@/redux/reducers/state';
import { Action } from '@/redux/actions';
import { screen } from '@/constants/screen';
import { MenuItemType } from '@/components/sign-up';
import { Skeleton } from '@/components/skeleton';
import { WrapWithLogin } from '@/components/with-login';
import { SelectParam } from 'antd/lib/menu';
import { MenuConfig, loginMenu, noLoginMenu } from './menu-config';
import classnames from 'classnames';
import './index.less';

const { Item, Divider } = Menu;

export interface HeaderProps extends RouteComponentProps {
  dispatch(action: Action): void;
  selectMenu: string;
  userInfo: UserInfo | null;
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
  const { selectMenu, dispatch, userInfo, login, location } = props;
  const [visible, setVisible] = useState(false);
  const [signUpMenu, setSignUpMenu] = useState<MenuItemType | null>(null);
  const [loading, setLoading] = useState(true);

  function hideModal() {
    setVisible(false);
  }

  const handleClickLogin = useCallback(() => {
    setVisible(true);
    setSignUpMenu('login');
  }, []);

  const handleClickRegister = useCallback(() => {
    setVisible(true);
    setSignUpMenu('register');
  }, []);

  // 检查用户是否已经登录
  const checkLogin = useCallback(async () => {
    try {
      const res = await apiGet(INIT);
      const userId = res.data.userInfo.uid ? res.data.userInfo.uid.slice(0, 8) : '';
      dispatch({
        type: 'GET_USERINFO',
        payload: {
          ...res.data.userInfo,
          uid: userId,
        },
      });
      dispatch({
        type: 'CHANGE_LOGIN_STATE',
        payload: true,
      });
    } catch (e) {
      dispatch({
        type: 'CHANGE_LOGIN_STATE',
        payload: false,
      });
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    checkLogin();
  }, [checkLogin]);

  useEffect(() => {
    const pathArr = location.pathname.split('/');
    const activeMenu = pathArr[1];
    dispatch({
      type: 'CHANGE_SELECT_MENU',
      payload: activeMenu,
    });
  }, [location.pathname, dispatch]);

  const handleMenuChange = useCallback(
    ({ key }: SelectParam | { key: string }) => {
      dispatch({
        type: 'CHANGE_SELECT_MENU',
        payload: key,
      });
    },
    [dispatch]
  );

  function renderHomeMenu(config: MenuConfig[], isMobile = false) {
    return (
      <Menu
        className={isMobile ? 'little_screen_menu' : 'home_menu'}
        mode={isMobile ? 'vertical' : 'horizontal'}
        selectedKeys={selectMenu ? [selectMenu] : []}
      >
        {isMobile
          ? config.map(({ key, to, text }, index, arr) => {
              return [
                <Item key={key} className="little_screen_menu_item">
                  {typeof to === 'function' ? (
                    <Link to={() => to(userInfo?.uid || '')}>{text}</Link>
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
                    <Link to={() => to(userInfo?.uid || '')}>{text}</Link>
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
      if (login && userInfo) {
        const { username, avatar, uid } = userInfo;
        return (
          <WrapOperation
            //@ts-ignore
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
    [login, userInfo, handleClickLogin, handleClickRegister]
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
      <Link to="/" className="back_to_home">
        <Icon component={Heart as any} className="back_to_home_icon" />
        <span className="back_to_home_text">Soul Harbor</span>
      </Link>
      {loading ? <UserSkeleton /> : renderUserState(login)}
      {visible && <WrapSignUp dispatch={dispatch} menu={signUpMenu} visible={visible} hide={hideModal} />}
    </div>
  );
}

export default withRouter(
  connect(({ header: { selectMenu }, user: { userInfo, login } }: State) => ({
    selectMenu,
    userInfo,
    login,
  }))(Header)
);
