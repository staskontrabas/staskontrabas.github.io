/**
 * Карта навигации в сайдбаре
 * @param {Object} main Объект формирующий сайдбар слева (РАЗДЕЛ), ссылку обратно, название сайдбара, * название страницы (в toolbar)
 *  @param {String} title Название сайдбара. В зависимости от типа: ссылка на изображение,  *  строка, шаблон
 *  @param {String} title_type Тип Названия сайдбара. {img} - ссылка на изображение, {text} -
 *  название, {template} - компонент для формирования
 *  @param {String} parentLink ссылка назад. Значения параметров заменяются маской
 *   с названием параметра вида {parameter}
 *  @param {Boolean} drawer показать/скрыть сайдбар
 *  @param {String} type тип сайдбара {nav} - список страниц, {folders} - список групп папок
 *  @param {String} clone копирует все поля указанного раздела, заменяя объявленными
 *  @param {Array} list список ссылок на страницы для типа {nav}. Для других типов
 *      служебная информация для названия страницы
 *      @param {String} name имя страницы (соответсвует имени в роутере). Пустое, если это
 *      ссылка на раздел
 *      @param {String} title название ссылки на страницу (используется как название
 *       для конечной страницы)
 *      @param {String} link ссылка на страницу
 **/

// import i18n from '@/i18n'

// не соответствует текущему дизайну, изменить, сейчас нет времени - Шишмарев

export default {
    'workflow': {
        title: 'Документооборот',
        title_type: 'img',
        parentLink: '',
        drawer: false,
        type: 'nav',
        list: []
    },
    'workflow-project': {
        title: 'Logo_text.svg',
        title_type: 'img',
        parentLink: '/workflow',
        drawer: true,
        type: 'nav', 
        list: [
            {
                id: 1,
                title: 'Файлы',
                icon: 'file',
                link: '/workflow/{id}/list',
                access_list: [],
                belongs_to: ['shared', 'workflow', ],
            },
            {
                id: 2,
                title: 'Проектная документация',
                icon: 'project-document',
                link: '/workflow/{id}/doc-design',
                access_list: [],
                belongs_to: ['workflow', 'expert',  ],
                },
            {
                id: 3,
                title: 'Проверки',
                icon: 'docs-reviews',
                link: '/workflow/{id}/doc-reviews',
                access_list: [],
                belongs_to: ['workflow', 'expert', ],
            },
            {
                id: 4,
                title: 'Модели',
                icon: 'model',
                link: '/workflow/{id}/models',
                access_list: [],
                belongs_to: ['consolidation', ],
            },
            {
                id: 5,
                title: 'Виды',
                icon: 'views',
                link: '/workflow/{id}/views',
                access_list: [],
                belongs_to: ['consolidation', ],
            },
            {
                id: 6,
                title: 'Коллизии',
                icon: 'collision',
                link: '/workflow/{id}/collisions',
                access_list: [],
                belongs_to: ['consolidation', 'expert', ],
            },
            {
                id: 7,
                title: 'Комплекты файлов',
                icon: 'transmittals',
                link: '/workflow/{id}/transmittals',
                access_list: [],
                belongs_to: ['workflow', ],
            },
            {
                id: 8,
                title: 'Проблемы',
                icon: 'issues',
                link: '/workflow/{id}/issues',
                access_list: [],
                belongs_to: ['workflow', 'consolidation', 'expert', ],
            },
            {
                id: 9,
                title: 'Отчеты',
                icon: 'reports',
                link: '/workflow/{id}/reports',
                access_list: [],
                belongs_to: ['workflow', 'consolidation', 'expert', ],
            },
            {
                id: 10,
                title: 'Компоненты',
                icon: 'component',
                link: '/workflow/{id}/components',
                access_list: [],
                belongs_to: ['workflow', ],
            },
            {
                id: 11,
                title: 'Корреспонденция',
                icon: 'correspondence',
                link: '/workflow/{id}/correspondence',
                access_list: [],
                belongs_to: ['consolidation', 'expert', ],
            },
            {
                id: 12,
                title: 'Статистика',
                icon: 'growth',
                link: '/administration/statistics',
                access_list: [],
                belongs_to: ['admin', ],
            },
            {
                id: 13,
                title: 'Проекты',
                icon: 'project',
                link: '/workflow/projects',
                access_list: [],
                belongs_to: ['admin', ],
            },
            {
                id: 14,
                title: 'Участники',
                icon: 'members',
                link: '/workflow/{id}/members',
                access_list: [],
                belongs_to: ['shared', 'workflow', 'consolidation', 'expert', ]
            },
            {
                id: 16,
                title: 'Роли',
                icon: 'permissions',
                link: '/administration/roles',
                access_list: [],
                belongs_to: ['admin', ]
            },
            {
                id: 17,
                title: 'Учетная запись',
                icon: 'users',
                link: '/administration/account',
                access_list: [],
                belongs_to: ['admin', ]
            },
            {
                id: 18,
                title: 'Параметры проекта',
                icon: 'settings',
                link: '/workflow/{id}/settings',
                access_list: [],
                belongs_to: ['shared', 'workflow', 'consolidation', 'expert', ]
            },
            {
                id: 19,
                title: 'Параметры',
                icon: 'settings',
                link: '/administration/settings',
                access_list: [],
                belongs_to: ['admin', ]
            },
        ]
    },
    'workflow-view': {
        title: '',
        title_type: 'template',
        parentLink: '/workflow/{id}/list/{path}',
        drawer: false,
        type: 'none',
        list: [{
            name: 'workflow',
            title: '',
            link: '/workflow',
            access_list: []
        }]
    },
    // 'model-view': {
    //     title: 'Logo_text.svg',
    //     title_type: 'img',
    //     parentLink: '/main',
    //     drawer: false,
    //     type: 'none',
    //     list: []
    // },
    'administration': {
        title: 'Администрирование',
        title_type: 'text',
        parentLink: '/main',
        drawer: true,
        type: 'nav',
        list: [
            {
                id: 1,
                name: 'statistics',
                title: 'Статистика',
                icon: 'growth',
                link: '/administration/statistics',
                access_list: [],
                belongs_to: ['accountadmin', ]
            },
            {
                id: 2,
                name: 'manageprojects',
                title: 'Проекты',
                icon: 'project',
                link: '/administration/manageprojects',
                access_list: ['owner'],
                belongs_to: ['accountadmin', ]
            },
            {
                id: 3,
                name: 'employees',
                title: 'Участники',
                icon: 'members',
                link: '/administration/employees',
                access_list: ['owner'],
                belongs_to: ['accountadmin', ]
            },
            {
                id: 4,
                title: 'Компании',
                icon: 'company',
                link: '/administration/other_companies',
                access_list: ['owner'],
                belongs_to: ['accountadmin', ]
            },
            {
                id: 5,
                name: 'roles',
                title: 'Роли',
                icon: 'permissions',
                link: '/administration/roles',
                access_list: ['owner'],
                belongs_to: ['accountadmin', ]
            },
            {
                id: 6,
                name: 'account',
                icon: 'users',
                title: 'Учетная запись',
                link: '/administration/account',
                access_list: [],
                belongs_to: ['accountadmin', ]
            },
            {
                id: 7,
                name: 'settings',
                icon: 'settings',
                title: 'Настройки',
                link: '/administration/settings',
                access_list: ['owner'],
                belongs_to: ['accountadmin', ]
            },
            {
                id: 8,
                name: 'project-members',
                icon: 'members',
                title: 'Участники',
                link: '/administration/project-members',
                access_list: ['owner'],
                belongs_to: ['projectadmin', ]
            },
            {
                id: 9,
                name: 'company',
                icon: 'company',
                title: 'Компания',
                link: '/administration/company',
                access_list: ['owner'],
                belongs_to: ['projectadmin', ]
            },
            {
                id: 10,
                name: 'notifications',
                icon: 'notifications',
                title: 'Уведомления',
                link: '/administration/notifications',
                access_list: ['owner'],
                belongs_to: ['projectadmin', ]
            },
            {
                id: 11,
                name: 'project-admin-settings',
                icon: 'settings',
                title: 'Настройки',
                link: '/administration/project-admin-settings',
                access_list: ['owner'],
                belongs_to: ['projectadmin', ]
            },
        ]
    }
}
