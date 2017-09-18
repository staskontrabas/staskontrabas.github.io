import React from 'react';
import { Router, Route, NoMatch, hashHistory, IndexRoute } from 'react-router';

import App from '../../components/app';
import Main from '../../components/main';
import Catalog from '../../components/catalog';
import ActionList from '../../components/action-list';
import ActionDetail from '../../components/action-detail';
import NewsList from '../../components/news-list';

import { NewsDetail } from '../../components/app/App.js';

export class Routes extends React.Component{
  render() {
    return (
      <Router history={hashHistory}>
        <Route path="/" name="Главная" component={App}>
          <IndexRoute component={Main} />
          <Route path="catalog" name="Каталог товаров">// breadcrumbIgnore >
            <IndexRoute component={Catalog} />
          </Route>
          <Route path="actions" name="Акции и спецпредложения">
            <IndexRoute component={ActionList} />
            <Route path=":id" component={ActionDetail} />
          </Route>
          <Route path="news" name="Новости">
            <IndexRoute component={NewsList} />
            <Route path=":id" component={NewsDetail} />
          </Route>
        </Route>
      </Router>
    );
  }
}