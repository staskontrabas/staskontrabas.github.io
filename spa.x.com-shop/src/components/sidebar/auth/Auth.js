import React from 'react';
import { Link } from 'react-router';

export default class Auth extends React.Component {
  render() {
    return (
      <ul className="list list_ident right-sidebar__auth">
        <li className="list__item list__item_inline">
          <Link className="link right-sidebar__auth-link" to="/login">
            <span className="text text_size_x-medium text_bold text_big text_color_contrast">Вход</span>
          </Link>
        </li>
        <li className="list__item list__item_inline">
          <Link className="link right-sidebar__auth-link" to="/registration">
            <span className="text text_size_x-medium text_bold text_big text_color_contrast">Регистрация</span>
          </Link>
        </li>
      </ul>
    );
  }
}