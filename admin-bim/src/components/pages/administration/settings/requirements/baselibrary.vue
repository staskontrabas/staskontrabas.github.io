<script>
export default {
    data(){
        return {
            baselibrary: [
                {
                    templatetitle: 'Уровни',
                    id: 'template.levels',
                    content: [
                        {
                            title: 'Уровни',
                            id: 'levels',
                            elements: [
                                {
                                    sectioncomment: 'Наименование формируется из 4 блоков, параметр уровня "Имя":',
                                    amountofgreensquares: 4,
                                }
                            ],
                            content: [
                                {
                                    title: "Корпус",
                                    id: "levels.frame",
                                    content: [],
                                    elements: [
                                        {
                                            typeofelement: 'SectionHeader',
                                            props: {
                                                checked: false,
                                                title: 'Корпус',
                                                description: 'Принадлежность к корпусу или части здания. В том случае, когда корпус в модели присутствует в единственном экземпляре, данный блок в его наименовании исключается.',
                                            },
                                        },
                                        {
                                            typeofelement: 'IgnoreMark',
                                            props: {
                                                checked: false,
                                                description: 'Игнорировать этот параметр для отметки уровня (0.000)',
                                            },
                                        },
                                        {
                                            typeofelement: 'CodeTable',
                                            props: {
                                                tablecontent: [],
                                                headers: {left: 'Код', right: 'Описание',},
                                                },
                                        },
                                    ],
                                },
                                {
                                    title: 'Коды уровней',
                                    id: 'levels.codes',
                                    content: [],
                                    elements: [
                                        {
                                            typeofelement: 'SectionHeader',
                                            props: {
                                                checked: false,
                                                title: 'Коды уровней',
                                                description: '',
                                            },
                                        },
                                        {
                                            typeofelement: 'IgnoreMark',
                                            props: {
                                                checked: false,
                                                description: 'Игнорировать этот параметр для отметки уровня (0.000)',
                                            },
                                        },
                                        {
                                            typeofelement: 'CodeTable',
                                            props: {
                                                tablecontent: [{ 'П': 'Паркинг' }, { 'Э': 'Этаж' }, { 'К': 'Кровля' }, { 'С': 'Стилобат' }, { 'Т': 'Технический этаж' },],
                                                headers: {left: 'Код', right: 'Описание',},
                                            },
                                        },
                                    ],
                                },
                                {
                                    title: 'Номер уровня',
                                    id: 'levels.number',
                                    content: [],
                                    elements: [
                                        {
                                            typeofelement: 'SectionHeader',
                                            props: {
                                                checked: false,
                                                title: 'Номер уровня',
                                                description: 'Номер уровня в параметре Фасад. Номер содержит двузначное значение  «хх» начинающееся с «01».',
                                            },
                                        },
                                        {
                                            typeofelement: 'IgnoreMark',
                                            props: {
                                                checked: false,
                                                description: 'Игнорировать этот параметр для отметки уровня (0.000)',
                                            },
                                        },
                                    ],
                                },
                                {
                                    title: 'Отметка',
                                    id: 'levels.mark',
                                    content: [],
                                    elements: [
                                        {
                                            typeofelement: 'SectionHeader',
                                            props: {
                                                checked: false,
                                                title: 'Отметка',
                                                description: 'Отметка уровня в параметре Фасад. Отметка содержит значение фактического расположения «+/- х.ххх».',
                                            },
                                        },
                                        {
                                            typeofelement: 'IgnoreMark',
                                            props: {
                                                checked: false,
                                                description: 'Игнорировать этот параметр для отметки уровня (0.000)',
                                            },
                                        },
                                        {
                                            typeofelement: 'Choice',
                                            props: {
                                                description: 'Использовать в качестве разделителя в значении:',
                                                mutuallyexsclusive: true,
                                                choices: ['0'],
                                                textelements: ['Знак точки «.» : (+/- x.xxx)', 'Знак запятой «,» : (+/- x,xxx)'],
                                            },
                                        }
                                    ],
                                },
                            ],
                        },
                    ]
                },
                {
                    templatetitle: 'Параметры ЦИМ-моделей',
                    id: 'template.tsm',
                    content: [
                        {
                            title: 'Параметры ЦИМ-моделей',
                            id: 'tsm',
                            elements: [
                                {
                                    sectioncomment: 'Для управления именованием файлов и его понимания принята максимально простая схема, где:',
                                    amountofgreensquares: 6,
                                }
                            ],
                            content: [
                                {
                                    title: 'Шифр проекта',
                                    id: 'tsm.cipher',
                                    content: [],
                                    elements: [
                                        {
                                            typeofelement: 'SectionHeader',
                                            props: {
                                                checked: false,
                                                title: 'Шифр проекта',
                                                description: 'Шифр проекта – шифр, идентифицирующий проект. Назначается до старта проекта.',
                                            },
                                        },
                                        {
                                            typeofelement: 'ObligatoryValue',
                                            props: {
                                                checked: false,
                                                hastype: true,
                                                valueexpression: '',
                                                namingtype: '0',
                                                headerleft: 'Количество символов',
                                                commentleft: 'Количество символов, которое будет использоваться в шифре проекта',
                                                headerright: 'Тип именования',
                                                commentright: 'Тип именования для шифра проекта',
                                            },
                                        },
                                    ],
                                },
                                {
                                    title: 'Корпус',
                                    id: 'tsm.frame',
                                    content: [],
                                    elements: [
                                        {
                                            typeofelement: 'SectionHeader',
                                            props: {
                                                checked: false,
                                                title: 'Корпус',
                                                description: 'Корпус – номер здания / корпуса / секции при наличии и согласно проекту. Назначается до старта проекта.',
                                            },
                                        },
                                        {
                                            typeofelement: 'CodeTable',
                                            props: {
                                                tablecontent: [],
                                                headers: {left: 'Код', right: 'Описание',},
                                                },
                                        },
                                    ],
                                },
                                {
                                    title: 'Стадия проекта',
                                    id: 'tsm.stage',
                                    content: [],
                                    elements: [
                                        {
                                            typeofelement: 'SectionHeader',
                                            props: {
                                                checked: false,
                                                title: 'Стадия проекта',
                                                description: '',
                                            },
                                        },
                                        {
                                            typeofelement: 'CodeTable',
                                            props: {
                                                tablecontent: [{ 'ОВ': 'Отопление и вентиляция' }, { 'ВК': 'Водоснабжение и канализация' }, { 'ПС': 'Генеральный план' }, { 'СС': 'Здание' },],
                                                headers: {left: 'Код', right: 'Описание',},
                                            },
                                        },
                                    ],
                                },
                                {
                                    title: 'Дисциплина',
                                    id: 'tsm.subject',
                                    content: [],
                                    elements: [
                                        {
                                            typeofelement: 'SectionHeader',
                                            props: {
                                                checked: false,
                                                title: 'Дисциплина',
                                                description: 'Указывается раздел разрабатываемой модели или принадлежность файла к сборкам, окружениям, заданиям на отверстия и другим вспомогательным файлам среды общих данных.',
                                            },
                                        },
                                        {
                                            typeofelement: 'CodeTable',
                                            props: {
                                                tablecontent: [{ 'АИ': 'Архитектурные решения интерьера' }, { 'АР': 'Архитектурные решения' }, { 'ГП': 'Генеральный план' },
                                                { 'ЗД': 'Задание' }, { 'ИОС': 'Инженерные решения' }, { 'КМ': 'Конструкции металлические' },
                                                { 'КЖ': 'Конструкции железобетонные' }, { 'АРМ': 'Армирование' }, { 'КФ': 'Координационный файл' },
                                                { 'ОКР': 'Окружение' }, { 'ОТВ': 'Отверстия' }, { 'СБР': 'Сборка' }, { 'ФК': 'Файл коллизий' },],
                                                headers: {left: 'Код', right: 'Описание',},
                                            },
                                        },
                                    ],
                                },
                                {
                                    title: 'Подраздел дисциплины',
                                    id: 'tsm.subsection',
                                    content: [],
                                    elements: [
                                        {
                                            typeofelement: 'SectionHeader',
                                            props: {
                                                checked: false,
                                                title: 'Подраздел дисциплины',
                                                description: 'Указывается подраздел разрабатываемой модели (Марка конструкции, ОВ1, ОВ2, ВК, задание на разработку лючков, отверстий и т.д.).',
                                            },
                                        },
                                        {
                                            typeofelement: 'CodeTable',
                                            props: {
                                                tablecontent: [{ 'ОВ': 'Отопление и вентиляция' }, { 'ВК': 'Водоснабжение и канализация' }, { 'ПС': 'Генеральный план' }, { 'СС': 'Здание' },],
                                                headers: {left: 'Код', right: 'Описание',},
                                            },
                                        },
                                        {
                                            typeofelement: 'ObligatoryValue',
                                            props: {
                                                checked: false,
                                                hastype: true,
                                                valueexpression: '',
                                                namingtype: '0',
                                                headerleft: 'Количество символов',
                                                commentleft: 'Количество символов, которое будет использоваться после сокращения ОВ. Пример: ОВ1, ОВ2.',
                                                headerright: 'Тип именования',
                                                commentright: 'Тип именования для шифра',
                                            },
                                        },
                                        {
                                            typeofelement: 'ObligatoryValue',
                                            props: {
                                                checked: false,
                                                hastype: false,
                                                valueexpression: '',
                                                namingtype: '0',
                                                headerleft: 'Обязательное значение',
                                                commentleft: 'Обязательное значение, которое должно указываться в наименовании подраздела дисциплины после сокращения. Пример: ВК_02, ОВ_02.',
                                                headerright: '',
                                                commentright: '',
                                            },
                                        },
                                    ],
                                },
                                {
                                    title: 'Версия программы',
                                    id: 'tsm.version',
                                    content: [],
                                    elements: [
                                        {
                                            typeofelement: 'SectionHeader',
                                            props: {
                                                checked: false,
                                                title: 'Версия программы',
                                                description: 'Указывается подраздел разрабатываемой модели (Марка конструкции, ОВ1, ОВ2, ВК, задание на разработку лючков, отверстий и т.д.).',
                                            },
                                        },
                                        {
                                            typeofelement: 'CodeTable',
                                            props: {
                                                tablecontent: [{ 'R': 'Revit' }, { 'Rn': 'Ренга' }, { 'Arc': 'ArchiCad' }, { 'Nnc': 'Nanocad' },],
                                                headers: {left: 'Код', right: 'Описание',},
                                            },
                                        },
                                        {
                                            typeofelement: 'ObligatoryValue',
                                            props: {
                                                checked: false,
                                                hastype: false,
                                                valueexpression: '',
                                                namingtype: '0',
                                                headerleft: 'Обязательное значение',
                                                commentleft: 'Обязательное значение, которое должно указываться в версии программы',
                                                headerright: '',
                                                commentright: '',
                                            },
                                        },
                                    ],
                                },
                            ]
                        },
                    ],
                },

                // %%%%%%%%%%%%%%%%%%% Кастомные %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

                {
                    templatetitle: 'Шаблон - Все сразу для тестов',
                    content: [
                        {
                            title: 'Секция - Все для тестов (1 уровень)',
                            content: [
								{
                                    title: 'Блок (2 уровень)',
                                    elements: [{
                                                    typeofelement: 'SectionHeader',
                                                    props: {
                                                        checked: true,
                                                        title: 'Заголовок блока - ур.2',
                                                        description: 'Описание блока ур.2',
                                                    },
                                                }, 
												{
                                                    typeofelement: 'IgnoreMark',
                                                    props: {
                                                        checked: true,
                                                        description: 'Метка для блока ур.2',
                                                    },
                                                },
												{
                                                    typeofelement: 'ObligatoryValue',
                                                    props: {
                                                        checked: true,
														hastype: true,
                                                        headerleft: 'Количество символов',
														headerright: 'Тип символов',
														commentleft: 'Подсказка по количеству символов',
														commentright: 'Подсказка для расшифровки',
														valueexpression: '1',
														namingtype: '0',
                                                    },
                                                }, 												
												{
                                                    typeofelement: 'CodeTable',
                                                    props: {
                                                        tablecontent: [{ 'П': 'Паркинг' }, { 'Э': 'Этаж' }, { 'К': 'Кровля' }, { 'С': 'Стилобат' }, { 'Т': 'Технический этаж' },],
                                                        headers: {left: 'JS', right: 'Не JS',},
                                                    },
                                                },
												{
													typeofelement: 'Choice',
													props: {
														description: 'Использовать в качестве разделителя в значении:',
														mutuallyexsclusive: true,
														choices: ['1'],
														textelements: ['Знак точки «.» : (+/- x.xxx)', 'Знак запятой «,» : (+/- x,xxx)'],
													},
												}],
                                    content: [
                                        {
                                            title: "Блок (3 уровень)",
                                            elements: [
                                                {
                                                    typeofelement: 'SectionHeader',
                                                    props: {
                                                        checked: true,
                                                        title: 'Заголовок блока - ур.3',
                                                        description: 'Описание блока ур.3',
                                                    },
                                                }, 
												{
                                                    typeofelement: 'IgnoreMark',
                                                    props: {
                                                        checked: true,
                                                        description: 'Метка для блока ур.3',
                                                    },
                                                },
												{
                                                    typeofelement: 'ObligatoryValue',
                                                    props: {
                                                        checked: true,
														hastype: true,
                                                        headerleft: 'Количество символов ур 3',
														headerright: 'Тип символов',
														commentleft: 'Подсказка по количеству символов',
														commentright: 'Подсказка для расшифровки',
														valueexpression: '1',
														namingtype: '0',
                                                    },
                                                }, 												
												{
                                                    typeofelement: 'CodeTable',
                                                    props: {
                                                        tablecontent: [{ 'П': 'Паркинг' }, { 'Э': 'Этаж' }, { 'К': 'Кровля' }, { 'С': 'Стилобат' }, { 'Т': 'Технический этаж' },],
                                                        headers: {left: 'JS', right: 'Не JS',},
                                                    },
                                                },
												{
													typeofelement: 'Choice',
													props: {
														description: 'Ур 3. Использовать в качестве разделителя в значении:',
														mutuallyexsclusive: true,
														choices: ['1'],
														textelements: ['Знак точки «.» : (+/- x.xxx)', 'Знак запятой «,» : (+/- x,xxx)'],
													},
												}],
                                        },
                                    ],
                                },
							],
                            elements: [],
                        }
                    ]
                },
                {
                    templatetitle: 'Tiptap',
                    content: [
                        {
                            title: '',
                            content: [
								{
                                    title: 'Шаблон - редактируемый элемент',
                                    elements: [
												{
													typeofelement: 'Editor',
													props: {
														description: 'Отредактируйте текст',
													},
												}],
                                    content: [],
                                },
							],
                            elements: [],
                        }
                    ]
                },
            ]
        }}}


</script>

