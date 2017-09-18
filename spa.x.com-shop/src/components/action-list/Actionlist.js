import React from 'react';
import ActionItem from '../../components/action-item';

const actionsList = [
  { id: '1', url: 'compscopl', img: 'static/img/action_05.png', date: '14 октября 2014 — ...', title: 'Купоны — наши еженедельные скидки на товары!', href: 'action-detail.html' },
  { id: '2', url: 'compscopl', img: 'static/img/action_05.png', date: '14 октября 2014 — ...', title: 'Купоны — наши еженедельные скидки на товары!', href: 'action-detail.html' },
  { id: '3', url: 'compscopl', img: 'static/img/action_05.png', date: '14 октября 2014 — ...', title: 'Купоны — наши еженедельные скидки на товары!', href: 'action-detail.html' },
  { id: '4', url: 'compscopl', img: 'static/img/action_05.png', date: '14 октября 2014 — ...', title: 'Купоны — наши еженедельные скидки на товары!', href: 'action-detail.html' },
  { id: '5', url: 'compscopl', img: 'static/img/action_05.png', date: '14 октября 2014 — ...', title: 'Купоны — наши еженедельные скидки на товары!', href: 'action-detail.html' },
  { id: '6', url: 'compscopl', img: 'static/img/action_05.png', date: '14 октября 2014 — ...', title: 'Купоны — наши еженедельные скидки на товары!', href: 'action-detail.html' }
];

export default class ActionList extends React.Component {
  render () {
    return (
      <div className="actions-list">
        {actionsList.map((act, i) => (
          <ActionItem key={i} act={act} />
        ))}
      </div>
    );
  }
}