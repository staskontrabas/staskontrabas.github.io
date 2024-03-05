import Vue from 'vue'
// import i18n from '@/i18n'
import Router from 'vue-router'
import store from '@/store'
import Init from '@/components/core/Init.vue'
import Layout from '@/components/core/Layout.vue'
import Dummy from '@/components/pages/Dummy.vue'
import Callback from '@/components/pages/Callback.vue'
import Main from '@/components/pages/Main.vue'
import Moduls from '@/components/pages/Moduls.vue'

//import Cloud from '@/components/pages/Cloud.vue' // for delete
import Engineering from '@/components/pages/Engineering.vue'
import Invite from '@/components/pages/Invite.vue'
import Administration from '@/components/pages/Administration.vue'

/*  //for delete
import Projects from '@/components/pages/cloud/Projects.vue'
import CommonAc from '@/components/pages/cloud/CommonAc.vue'
import Basket from '@/components/pages/cloud/Basket.vue'
import BasketList from '@/components/pages/cloud/basket/BasketList.vue'
*/

/*    //for delete
import ProjectList from '@/components/pages/cloud/projects/ProjectList.vue'
import ProjectItem from '@/components/pages/cloud/projects/ProjectItem.vue'
import Params from '@/components/pages/cloud/projects/Params.vue'
import Objects from '@/components/pages/cloud/projects/Objects.vue'
import Materials from '@/components/pages/cloud/projects/Materials.vue'
*/

import Workflow from '@/components/pages/Workflow.vue'
import DctView from '@/components/pages/workflow/DctView.vue'
import WorkflowList from '@/components/pages/workflow/WorkflowList.vue'
import WorkflowProject from '@/components/pages/workflow/WorkflowProject'
import WorkflowReviews from '@/components/pages/workflow/WorkflowReviews'
import WorkflowTransmittals from '@/components/pages/workflow/WorkflowTransmittals'
import WorkflowIssues from '@/components/pages/workflow/WorkflowIssues'
import WorkflowReports from '@/components/pages/workflow/WorkflowReports'
import WorkflowMembers from '@/components/pages/workflow/WorkflowMembers'
import WorkflowSettings from '@/components/pages/workflow/WorkflowSettings'
import WorkflowDocDesign from '@/components/pages/workflow/WorkflowDocDesign'
import WorkflowCollisions from '@/components/pages/workflow/WorkflowCollisions'
import WorkflowModels from '@/components/pages/workflow/WorkflowModels'
import WorkflowViews from '@/components/pages/workflow/WorkflowViews'
import WorkflowComponents from '@/components/pages/workflow/WorkflowComponents'
import WorkflowCorrespondence from '@/components/pages/workflow/WorkflowCorrespondence'
//
import RemovedFiles from '@/components/pages/workflow/RemovedFiles'
import ManageTasks from '@/components/pages/workflow/ManageTasks'

import Account from '@/components/pages/administration/Account.vue'
import Statistics from '@/components/pages/administration/Statistics.vue'
import Projects from '@/components/pages/administration/Projects.vue'
import Settings from '@/components/pages/administration/Settings.vue'
import Payment from '@/components/pages/administration/Payment.vue'
import OtherCompanies from '@/components/pages/administration/OtherCompanies.vue'
import Roles from '@/components/pages/administration/Roles.vue'
import ProjectMembers from '@/components/pages/administration/ProjectMembers.vue'
import Notifications from '@/components/pages/administration/Notifications.vue'
import ProjectAdminSettings from '@/components/pages/administration/ProjectAdminSettings.vue'

import Control from '@/components/pages/administration/payment/Control.vue'
// import ControlAdmin from '@/components/pages/administration/payment/ControlAdmin.vue'

import SettingsList from '@/components/pages/administration/settings/SettingsList.vue'
import Company from '@/components/pages/administration/settings/Company.vue'
import Employees from '@/components/pages/administration/settings/Employees.vue'
import Rights from '@/components/pages/administration/settings/Rights.vue'
import Version from '@/components/pages/administration/settings/Version.vue'
import Content from '@/components/pages/administration/settings/Content.vue'
import Requirements from '@/components/pages/administration/settings/Requirements.vue'

import EmployeesList from '@/components/pages/administration/settings/employees/EmployeesList.vue'
import EmployeesInvite from '@/components/pages/administration/settings/employees/EmployeesInvite.vue'
import EmployeeAccount from '@/components/pages/administration/settings/employees/Account.vue'

Vue.use(Router)

const router = new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    scrollBehavior(){
        return { x: 0, y: 0 }
    },
    routes: [{
        path: '*',
        redirect: { name: 'projects' },
    },
    /*
    {
        path: '/',
        name: 'init',
        component: Init
    },*/
    {
        path: '',
        component: Layout,
        children: [{
            path: '',
            redirect: { name: 'projects' }
        },
        {
            path: 'callback',
            component: Callback,
            meta: {
                part: 'main'
            }
        },
        {
            name: 'main-page',
            path: 'main',
            redirect: { name: 'projects' },
            component: Dummy,
            meta: {
                part: 'main',
                crumbs: 'Главная страница'
            }
        },
        {
            path: 'engineering',
            component: Engineering,
            meta: {
                part: 'main'
            },
            children: [{
                path: '',
                redirect: 'moduls'
            },{
                path: 'moduls',
                component: Dummy,
                meta: {
                    part: 'engineering',
                    crumbs: 'Модули'
                },
            },{
                path: 'teamwork',
                component: Dummy,
                meta: {
                    part: 'engineering',
                    crumbs: 'Совместная работа'
                },
            },{
                path: 'callback',
                component: Dummy,
                meta: {
                    part: 'engineering',
                    crumbs: 'Обратная связь'
                },
            },{
                path: 'reference',
                component: Dummy,
                meta: {
                    part: 'engineering',
                    crumbs: 'Справка'
                },
            }]
        },
        {
            path: 'workflow',
            component: Workflow,
            children: [{
                path: '',
                redirect: {name: 'projects'}
            },{
                name: 'projects',
                path: 'projects',
                component: WorkflowList,
                meta: {
                    part: 'workflow',
                    crumbs: 'Проекты'
                }
            },{
                name: 'workflow-view',
                path: ':id/ubviewer/:type',
                components: {default: DctView},
                meta: {
                    part: 'workflow-view'
                },
                props: {
                    default: true
                }
            },{
                name: 'workflow-project',
                path: ':id/list/:path?',
                component: WorkflowProject,
                meta: {
                    part: 'workflow-project',
                    crumbs: 'Документооборот'
                },
                props: true
            },{
                name: 'workflow-doc-design',
                path: ':id/doc-design/:path?',
                component: WorkflowDocDesign,
                meta: {
                    part: 'workflow-project',
                    crumbs: 'Проектная документация'
                },
                props: true
            },{
                name: 'workflow-reviews',
                path: ':id/doc-reviews/:path?',
                component: WorkflowReviews,
                meta: {
                    part: 'workflow-project',
                    crumbs: 'Проверки'
                },
                props: true
            },{
                name: 'workflow-collisions',
                path: ':id/collisions/:path?',
                component: WorkflowCollisions,
                meta: {
                    part: 'workflow-project',
                    crumbs: 'Коллизии'
                },
                props: true
            },{
                name: 'workflow-models',
                path: ':id/models/:path?',
                component: WorkflowModels,
                meta: {
                    part: 'workflow-project',
                    crumbs: 'Модели'
                },
                props: true
            },{
                name: 'workflow-views',
                path: ':id/views/:path?',
                component: WorkflowViews,
                meta: {
                    part: 'workflow-project',
                    crumbs: 'Виды'
                },
                props: true
            },{
                name: 'workflow-transmittals',
                path: ':id/transmittals/:path?',
                component: WorkflowTransmittals,
                meta: {
                    part: 'workflow-project',
                    crumbs: 'Комплекты файлов'
                },
                props: true
            },{
                name: 'workflow-issues',
                path: ':id/issues/:path?',
                component: WorkflowIssues,
                meta: {
                    part: 'workflow-project',
                    crumbs: 'Проблемы'
                },
                props: true
            },{
                name: 'workflow-reports',
                path: ':id/reports/:path?',
                component: WorkflowReports,
                meta: {
                    part: 'workflow-project',
                    crumbs: 'Отчеты'
                },
                props: true
            },{
                name: 'workflow-components',
                path: ':id/components/:path?',
                component: WorkflowComponents,
                meta: {
                    part: 'workflow-project',
                    crumbs: 'Компоненты'
                },
                props: true
            },{
                name: 'workflow-correspondence',
                path: ':id/correspondence/:path?',
                component: WorkflowCorrespondence,
                meta: {
                    part: 'workflow-project',
                    crumbs: 'Корреспонденция'
                },
                props: true
            },
            // {
            //     name: 'workflow-statistics',
            //     path: ':id/statistics/:path?',
            //     component: WorkflowStatistics,
            //     meta: {
            //         part: 'workflow-project',
            //         crumbs: 'Статистика'
            //     },
            //     props: true
            // },
            {
                name: 'workflow-members',
                path: ':id/members',
                component: WorkflowMembers,
                meta: {
                    part: 'workflow-project',
                    crumbs: 'Участники проекта'
                },
                props: true
            },{
                name: 'workflow-settings',
                path: ':id/settings',
                component: WorkflowSettings,
                meta: {
                    part: 'workflow-project',
                    crumbs: 'Параметры проекта'
                },
                props: true
            },{
                name: 'managetasks',
                path: 'managetasks',
                component: ManageTasks,
                meta: {
                    part: 'workflow',
                    crumbs: 'Управление задачами'
                }
            },{
                path: 'deleted',
                component: RemovedFiles,
                meta: {
                    part: 'workflow',
                    crumbs: 'Удаленные файлы'
                },
            },{
                path: 'sharing',
                component: Dummy,
                meta: {
                    part: 'workflow',
                    crumbs: 'Общий доступ'
                },
            },{
                path: 'archive',
                component: Dummy,
                meta: {
                    part: 'workflow',
                    crumbs: 'Архив'
                },
            },{
                path: 'callback',
                component: Dummy,
                meta: {
                    part: 'workflow',
                    crumbs: 'Обратная связь'
                },
            },{
                path: 'reference',
                component: Dummy,
                beforeEnter: (to, from, next) => {
                    window.open('https://doc.unitbim.ru/')
                },
                meta: {
                    part: 'workflow',
                    crumbs: 'Справка'
                },
            }],
        },
        {
            name: 'invite',
            path: 'invite',
            component: Invite,
            meta: {
                part: 'main',
                crumbs: 'Приглашение'
            }
        },
        {
            path: 'administration',
            component: Administration,
            children: [{
                path: '',
                redirect: { name: 'account' },
            },
            {
                name: 'statistics',
                path: 'statistics/:path?',
                component: Statistics,
                meta: {
                    part: 'administration',
                    crumbs: 'Статистика'
                },
            },
            {
                name: 'manageprojects',
                path: 'manageprojects/:path?',
                component: Projects,
                meta: {
                    part: 'administration',
                    crumbs: 'Управление проектами'
                },
            },
            // {
            //     name: 'members',
            //     path: 'members/:path?',
            //     component: Members,
            //     meta: {
            //         part: 'administration',
            //         crumbs: 'Участники'
            //     },
            // },
            {
                name: 'employees',
                path: 'employees',
                component: Employees,
                meta: {
                    part: 'administration',
                    crumbs: 'Участники'
                },
                children: [
                    {
                        name: 'employees',
                        path: '',
                        component: EmployeesList,
                        meta: {
                            part: 'administration'
                        }
                    },{
                        name: 'employees_invite',
                        path: 'invite',
                        component: EmployeesInvite,
                        meta: {
                            part: 'administration',
                            crumbs: 'Пригласить пользователя'
                        }
                    },{
                        name: 'employee_account',
                        path: 'account/:id',
                        component: EmployeeAccount,
                        meta: {
                            part: 'administration',
                            crumbs: 'Учетная запись'
                        },
                        props: true
                    }
                ]
            },
            {
                name: 'other_companies',
                path: 'other_companies',
                component: OtherCompanies,
                meta: {
                    part: 'administration',
                    crumbs: 'Компании'
                }
            },
            {
                name: 'roles',
                path: 'roles',
                component: Roles,
                meta: {
                    part: 'administration',
                    crumbs: 'Роли'
                }
            },
            {
                name: 'account',
                path: 'account',
                component: Account,
                meta: {
                    part: 'administration',
                    crumbs: 'Учетная запись'
                }
            },
            {
                name: 'project-members',
                path: 'project-members',
                component: ProjectMembers,
                meta: {
                    part: 'administration',
                    crumbs: 'Участники проекта'
                }
            },
            {
                name: 'company',
                path: 'company',
                component: Company,
                meta: {
                    part: 'administration',
                    crumbs: 'Компания'
                }
            },
            {
                name: 'notifications',
                path: 'notifications',
                component: Notifications,
                meta: {
                    part: 'administration',
                    crumbs: 'Уведомления'
                }
            },
            {
                name: 'project-admin-settings',
                path: 'project-admin-settings',
                component: ProjectAdminSettings,
                meta: {
                    part: 'administration',
                    crumbs: 'Настройки'
                }
            },
            {
                path: 'payment',
                component: Payment,
                beforeEnter: (to, from, next) => {
                    let role = store.state.administration.user.role
                    next(role == '1' || role == '2')
                },
                meta: {
                    part: 'administration',
                    crumbs: 'Оплата'
                },
                children: [{
                    path: '',
                    redirect: {name: 'control'}
                },
                {
                    name: 'control',
                    path: 'control',
                    component: Control,
                    meta: {
                        part: 'administration',
                    }
                },
                ]
            },
            {
                path: 'settings',
                component: Settings,
                meta: {
                    part: 'administration',
                    crumbs: 'Настройки'
                },
                children: [
                {
                    name: 'settings',
                    path: '',
                    component: SettingsList,
                    meta: {
                        part: 'administration'
                    }
                },{
                    name: 'company',
                    path: 'company',
                    component: Company,
                    meta: {
                        part: 'administration',
                        crumbs: 'Профиль компании'
                    }
                },{
                    name: 'accessrights',
                    path: 'accessrights',
                    component: Rights,
                    meta: {
                        part: 'administration',
                        crumbs: 'Права доступа'
                    }
                },{
                    name: 'content',
                    path: 'content',
                    component: Content,
                    meta: {
                        part: 'administration',
                        crumbs: 'Контент'
                    }
                },{
                    name: 'contragents',
                    path: 'contragents',
                    component: Dummy,
                    meta: {
                        part: 'administration',
                        crumbs: 'Контрагенты'
                    }
                },{
                    name: 'version',
                    path: 'version',
                    component: Version,
                    meta: {
                        part: 'administration',
                        crumbs: 'Версионность'
                    }
                },
                // {
                //     name: 'requirements',
                //     path: 'requirements',
                //     component: Requirements,
                //     meta: {
                //         part: 'administration',
                //         crumbs: 'Требования к информационной модели'
                //     }
                // },
                {
                    name: 'activity',
                    path: 'activity',
                    component: Dummy,
                    meta: {
                        part: 'administration',
                        crumbs: 'Активность'
                    }
                },]
            }]
        }]
    }]
})

// router.afterEach((to, from) => {
//     Vue.nextTick(() => {
//         document.title = to.meta.title ? to.meta.title : 'UnitBim'
//     })
// })

router.beforeEach((to, from, next) => {
    document.title = to.meta.title ? to.meta.title : 'UnitBim'

    if(!store.state.administration.existUser){

        //store.commit('auth/rememberRouter', JSON.parse(JSON.stringify(to)))
        store.commit('administration/existUser', true)

        let query = to.query


        let tokenInfo = {
            access_token: "-cf3U3CCyjocV5CYmR8Rk7JRyPqOhlXP_XUd35g1DWU.b6Fa0lnFiR0EbFIxVLqlLTIf3YMr_QUdbO9h56fbj_Y",
            expiry: 1660886741,
            id_token: "eyJhbGciOiJSUzI1NiIsImtpZCI6InB1YmxpYzo4MjVmMGQ5YS0zOTI5LTQwNjYtODU3YS02NzBmZTVkYTNmZGQifQ.eyJhdF9oYXNoIjoiWm5EOFRjeUlkcmNaUVNFVGhCTzRqQSIsImF1ZCI6WyJ1Yl9zdG9yZV9kZXYiXSwiYXV0aF90aW1lIjoxNjYwODgxODk1LCJlbWFpbCI6InN0YXItc2hpbmVzQGluYm94LnJ1IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImV4cCI6MTY2MDg4Njc0MSwiZmFtaWx5X25hbWUiOiLQodC10YDQtdCx0YDQtdC90L3QuNC60L7QstCwIiwiZ2l2ZW5fbmFtZSI6ItCh0L7RhNC4IiwiaWF0IjoxNjYwODgzMTQxLCJpc3MiOiJodHRwczovL2xvZ2luLnViZGV2LnJ1LyIsImp0aSI6IjdjZWU5NDA5LTBkNDYtNDI0MS1iZTU3LWVhODI4MmViNWY5YiIsIm1pZGRsZV9uYW1lIjoi0JDQu9C10LrRgdCw0L3QtNGA0L7QstC90LAiLCJuYW1lIjoi0KHQvtGE0LgiLCJuaWNrbmFtZSI6InN0YXItc2hpbmVzQGluYm94LnJ1IiwicHJlZmVycmVkX3VzZXJuYW1lIjoic3Rhci1zaGluZXNAaW5ib3gucnUiLCJyYXQiOjE2NjA4ODE4ODQsInNpZCI6ImM2OWQ5ZTViLWZmMmQtNDg4ZS05MjFmLWU1YzM0ODkyNTc0MiIsInN1YiI6InN0YXItc2hpbmVzQGluYm94LnJ1In0.NBqBMMgYi08HTQ_T50iiskUmd6BM-gQHTX7NnnGSZn6t6ABZOdkDMcUYCTfQkncGMe69e6s05VeHKcwF-AdeVbndWsNXsRvKtzxE3RB8PM8tSRDd120_Bn8byv5XFr5j_eYiLjy1g7he7Nosv7Lwml3GiuMtUzTjT9pX1WUTJjExCpcbu9gslkVz3wc4LgsPQ-1zd9AUcO4G4looihgJicFg1bF2il-hBjY-8NA68KOhA0CmlkEip9UPZyOfUXkNHdjWlkaAGS0O7588u2NPWR6s_RGt2pYeW1ZYfZyr0WTrjpGw2O0peH9Xezci7eE_9bmI8AP0eK3mQ7txBfM6Kww0F2gZ8fAjNuOw8Ilxmc1diLgANV4Rkw8-V2ctB2ugXM-IXva8mYl81bt89famrOP-Lfv-Dtu2G_FnIhyVAesJAJHjo4r8n9iFqb4meXH69cRjBiUUkfY4dkXn27AnstSqV7YeTtcHDt2xnb5xqJ4II6NtMhmFziIWLW2hq9LUaX46hoNeNPq60gu5Nk4oH3KAGh9-H5P83Vf7ZBRgGBK9GxkJ9Ktj76pp26tadb_gVfFV-EqMrlD3eIymQhpgOkj4hhu8zqRqPixDWs_8LOhSeTNV9fkhD7V9CL1gqUnpVEluqljMs0ysawq_oLtTK2Oe9HqKPAtysIW6fE13guI",
            refresh_token: "tdFGXpINxnxpZfjyNxpwYFueK5rIDbJiZz-YPCaFdLs.Kx8agaMLzN5ho9e23FrgqOy7hamrhpwSmD1A8BEDaR0",
            token_type: "bearer"
        }


/* ******************   FOR LOCALHOST    ********************/
        if(location.host.split(':')[0] == 'localhost'){
            //Object.prototype.hasOwnProperty.call(query, 'id_token')

            let tokenInfo = {
                access_token: "IBEiU3iwMfppjMJmf_m7EM-13PI2zxzRQpMLMsNMiPU.jldNPAtx-s9blR2gjANVuPBAadGs3l06rK-5gzLocbA",
expiry: 1701276246,
id_token: "eyJhbGciOiJSUzI1NiIsImtpZCI6InB1YmxpYzo4MjVmMGQ5YS0zOTI5LTQwNjYtODU3YS02NzBmZTVkYTNmZGQifQ.eyJhdF9oYXNoIjoiQzhYVXZ0ekRTeUFSZzVqM1QtU1hwdyIsImF1ZCI6WyI5ODE1Mjk3My1jZjQ5LTQ5NGYtYTU1ZS05MmRiZmMzNzU1NjQiXSwiYXV0aF90aW1lIjoxNjk5MzQ0OTcyLCJlbWFpbCI6InRhcmFzQHVuaXRiaW0ucnUiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZXhwIjoxNzAxMjc2MjQ3LCJmYW1pbHlfbmFtZSI6ItCjIiwiZ2l2ZW5fbmFtZSI6ItCi0LDRgNCw0YEiLCJpYXQiOjE3MDEyNzI2NDcsImlzcyI6Imh0dHBzOi8vbG9naW4udWJkZXYucnUvIiwianRpIjoiN2FhOGQ0NWEtOGVjYy00ZDc1LWJkYWMtNjA0MzgyMmI3YzE4IiwibWlkZGxlX25hbWUiOiLQpCIsIm5hbWUiOiLQotCw0YDQsNGBIiwibmlja25hbWUiOiJ0YXJhc0B1bml0YmltLnJ1IiwicHJlZmVycmVkX3VzZXJuYW1lIjoidGFyYXNAdW5pdGJpbS5ydSIsInJhdCI6MTcwMTI3MjYyNywic2lkIjoiMjE4MDQyNzAtN2ExMS00ZjljLTlkZGQtMGQ2NjRhNjZkMmEzIiwic3ViIjoidGFyYXNAdW5pdGJpbS5ydSJ9.VmgBRZV5JNG-r_RvSKd_RQnUCvNikvrt7DLm4w4zLtRkJPWhgrxrK0A7hhKYSESX_BFDkimVRpQiW8-fsiz8pio5DLsd54ULFG8YErfAQzqWAnm-doKr9afW9sW7DBUA_HHodxsBg0YveHxRqsBjhMILeYBFvsXLrK3GJOnXT7T5G4qrNxMQ-AcbwkzWZTlrPhIrq9dqKAqSbXPLhqCA7gJ4opnsvOZClDSihOXFrAgO9jJhn7m2NJdSFOF3dDpws7zT4x38ux8D5CU876ChcE33jDVwBLA59bt9Aos6B6IKuN-JxmNdocblm5UF8DwhC9NVfZB5fObtY05C_Cb_vK00B-T6wF9ytKOlJ1icIq5Df3KO8JZhWwHnZ8_qAQdwS4X4Pv0HzInUwlSeqfn4O-28mgaBFoXn0MCkHDPwfNW-FDm_ViVPffkKIeb1L6iEDCAnVC1LR1kWB9fsULIWx8lysDvXECphQEiZufLrEWvD3R-2fCjzcbtgF9-dfZvwUb5kTKSwYX5NHMf4USbn7COLgE7VtiMuhxVnvVpVYrJ_vH2EM0p12R8lYlvJuPgoQ3qXrYxv4BdRHS31xhGDVbZhCD0E_T9JYI37VZGM2oWYsmTd_7dTESWpZNGyddPxaVnZfIMFsq9VIrmbgoFfVTDTo1QWkmkeVkr9G_i5ATo",
refresh_token: "mTm8kCg6KIFMXajGY683qsU1-J2tpTJh-EIzDueKxPk.2WTkRx19FJ4HaDixpgQaNR1_zRSIhf5BrqIylCXJ8EI",
token_type: "bearer"
            }

// let tokenInfo = JSON.parse(localStorage.getItem('token'))


            store.dispatch('auth/refresh')
            .then(res => {
                if(res){
                    store.dispatch('auth/setTokenId', res)
                    .then(() => {
                        next()
                    })
                }
                else{
                    localStorage.setItem('token', JSON.stringify(tokenInfo))
                    store.dispatch('auth/setTokenId', tokenInfo)
                    .then(() => {
                        next()
                    })
                }
            })
        }
/**/
//////////////////  FOR PRODACTION  /////////////////////////////////
/**/
        else{
            store.dispatch('auth/refresh')
            .then(res => {
                if(!res){
                    if(to.path === '/callback'){
                        store.dispatch('auth/token', {
                            code: query.code,
                            state: query.state
                        })
                        .then(res => {
                            let stateInit = JSON.parse(localStorage.getItem('state'))
                            if(stateInit.path === '/invite'){
                                store.commit('setToken', res)
                                return true
                            }
                            else{
                                return store.dispatch('auth/setTokenId', res)
                            }
                        })
                        .then(() => {
                            let stateInit = JSON.parse(localStorage.getItem('state'))
                            let url = stateInit.url || '/'

                            if(stateInit.path === '/callback'){
                                url = '/'
                            }
                            if(stateInit.path === '/invite'){
                                store.commit('administration/existUser', false)
                            }
                            return url
                        })
                        .then(res => {
                            next(res)
                        })
                    }// для callback
                    else if(to.path === '/invite'){
                        localStorage.setItem('state', JSON.stringify({
                            path: to.path,
                            url: to.fullPath,
                            query: to.query
                        }))
                        //store.commit('auth/setInviteCode', query.code)
                        store.dispatch('auth/checkInvite', {
                            code: to.query.code,
                            redirect_url: to.fullPath
                        })
                    }
                    else{
                        store.dispatch('auth/getCodeForToken')
                    }
                }// нет рефреш токена
                else{//есть рефреш токен
                    if(to.path === '/invite'){
                        store.dispatch('auth/checkInvite', {
                            code: to.query.code
                        })
                        .then(() => {
                            store.commit('administration/existUser', true)
                            return true
                        })
                        .then(() => {
                            return store.dispatch('auth/setTokenId', res)
                        })
                        .then(() => {
                            next()
                        })
                    }
                    else{
                        store.dispatch('auth/setTokenId', res)
                        .then(() => {
                            next()
                        })
                    }
                }
            })
        }
    }
    else{
        let localState = JSON.parse(localStorage.getItem('state'))
        localStorage.setItem('state', JSON.stringify({
            ...localState,
            path: to.path,
            url: to.fullPath
        }))

        localState = JSON.parse(localStorage.getItem('token')) || {expiry: false}
        let expiry = store.state.auth.expiry
                    || localState.expiry
        if(expiry){
            let now = new Date()
            let out = new Date((expiry * 1000))
            let left = parseInt((out.getTime() - now.getTime()) / 1000 / 60)
            if(left < 5){
                store.dispatch('auth/refresh')
                .then(res => {
                    if(res){
                        next()
                    }
                    else{
                        store.dispatch('auth/getCodeForToken')
                    }
                })
            }
            else{
                next()
            }
        }
        else{
            store.dispatch('auth/getCodeForToken')
        }
    }
})

export default router
