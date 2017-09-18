(function ($, document) {
    var $catalogNav = $('#catalog_nav');

    var handleCatalogNavSiteSwitching = function () {
        var $siteSwitcher = $catalogNav.find('.site-switcher'),
            $siteSwitcherItems = $siteSwitcher.find('li'),
            $siteSwitcherSpans = $siteSwitcherItems.find('span');

        $siteSwitcherSpans.click(function () {
            var $this = $(this),
                $siteSwitcherItem = $this.parent('li'),
                targetSite = $siteSwitcherItem.data('site');

            if ($catalogNav.hasClass(targetSite)) {
                return false;
            }

            $catalogNav.find('.catalog-menu').find('.main-menu').hide();

            $siteSwitcherItems.each(function (i, e) {
                $catalogNav.removeClass($(e).data('site'));
            });

            $catalogNav.addClass(targetSite);

            var action;

            if (targetSite == 'shop') {
                action = '/search/';
            } else if (targetSite == 'dom') {
                action = '//www.xcom-dom.ru/search/';
            }

            window.location.hash = targetSite;

            if (action) {
                $catalogNav.find('.search').attr('action', action);
            }
        });
    };

    var handleCatalogNavMainMenu = function () {
        $catalogNav.find('.show-main-menu').click(function () {
            var $mainMenu;

            if ($catalogNav.hasClass('shop')) {
                $mainMenu = $catalogNav.find('.main-menu.shop');
            } else {
                $mainMenu = $catalogNav.find('.main-menu.dom');
            }

            $mainMenu.stop().slideToggle(250);
        });
    };

    var handleCatalogNavSubfoldersMenu = function () {
        var $catalogMenu = $catalogNav.find('.catalog-menu'),
            $catalogMenuList = $catalogMenu.find('> ul'),
            $catalogMenuItems = $catalogMenuList.find('> li');

        $catalogMenuItems.hover(function () {
            $catalogNav.find('.subfolders-menu-vertical').hide()
                .prev()
                .removeClass('active');

            var $menu = $('.subfolders-menu-vertical', this);

            if (!$menu.length) {
                return false;
            }

            var styles = {
                'left':  0,
                'right': 'auto'
            };

            if ($menu.width() + 50 > $(document).outerWidth() - $(this).offset().left) {
                styles.left = 'auto';
                styles.right = 0;
            }

            $menu.finish()
                .css(styles)
                .slideDown(250)
                .prev()
                .addClass('active');
        }, function () {
            var $menu = $('.subfolders-menu-vertical', this);

            if (!$menu.length) {
                return false;
            }

            $menu.hide()
                .prev()
                .removeClass('active');
        });

        var $item = $catalogNav.find('.subfolders-menu-vertical > .item');

        $item.hover(function () {
            var $childs = $('.childs', this);

            if (!$childs.length) {
                return false;
            }

            var styles = {
                'left':  $childs.width(),
                'right': 'auto',
                'top':   -1
            };

            if ($childs.width() + 50 > $(document).width() - $(this).offset().left - $(this).outerWidth()) {
                styles.left = 'auto';
                styles.right = $(this).outerWidth();
            }

            $childs.finish()
                .css(styles)
                .show(250)
                .prev()
                .addClass('active');
        }, function () {
            var $childs = $('.childs', this);

            if (!$childs.length) {
                return false;
            }

            $childs.hide()
                .prev()
                .removeClass('active');
        });
    };

    var sortNode = function(data) {
        var sortable = [];
        for (var i in data) {
            sortable.push([i, data[i].value.name]);
        }

        sortable.sort(function(a, b) {
            if ( a[1] < b[1] )
                return -1;
            if ( a[1] > b[1] )
                return 1;
            return 0;
        });

        return sortable;
    }

    var createMainMenu = function(site) {
        var tree, 
            i, k;

        if (site == 'shop') {
            tree = tree_shop;
        }
        if (site == 'dom') {
            tree = tree_dom;
        }

        if (! tree) {
            return;
        }


        var $column;
        var $menu = $('<div class="main-menu '+site+'" style="display:none;"></div>').appendTo($catalogNav.find('.catalog-menu'));
        var per_column = Math.ceil(Object.keys(tree).length / 4);
        var ordered = sortNode(tree);

        i = 0;
        for(k in ordered) {
            if (i == per_column) {
                i = 0;
            }

            if (i == 0) {
                $column = $('<div class="column"></div>').appendTo($menu);
            };

            i++;
            $column.append('<p><a href="http://www.xcom-'+site+'.ru/catalog/'+tree[ordered[k][0]].value.name_url+'/" title="'+tree[ordered[k][0]].value.seo_h1+'">'+tree[ordered[k][0]].value.name+'</a></p>');
        }

        $menu.append('<div class="sitemap_link"><a href="http://www.xcom-'+site+'.ru/sitemap/" class="black">Посмотреть в развернутом виде</a>&nbsp;&rarr;</div>');
    }

    var createSubmenu = function(site) {
        $('.catalog-menu .'+site+' li').each(function(){
            var $this = $(this);
            var $submenu, $item, $children;
            var urlkey = $this.data('urlkey');
            var tree, order_node, order_children;
            var hasChildren;
            var i, z, k;

            if (site == 'shop') {
                tree = tree_shop;
            }
            if (site == 'dom') {
                tree = tree_dom;
            }

            for (i in tree) {
                if (tree[i].value.name_url == urlkey) {
                    $submenu = $('<div class="menu subfolders-menu-vertical" style="display: none"></div>').appendTo($this);

                    if (! $.isEmptyObject(tree[i]['in'])) {
                        order_node = sortNode(tree[i]['in']);
                        for (k in order_node) {
                            hasChildren = '';
                            if (! $.isEmptyObject(tree[i]['in'][order_node[k][0]]['in'])) {
                                hasChildren = ' has-childs';

                                $children = $('<div class="menu childs"></div>');

                                order_children = sortNode(tree[i]['in'][order_node[k][0]]['in']);
                                for(z in order_children) {
                                    $children.append('<div class="item"><a href="http://www.xcom-'+site+'.ru/catalog/'+urlkey+'/'+tree[i]['in'][order_node[k][0]].value.name_url+'/'+tree[i]['in'][order_node[k][0]]['in'][order_children[z][0]].value.name_url+'/" class="black tx13">'+tree[i]['in'][order_node[k][0]]['in'][order_children[z][0]].value.name+'</a></div>');
                                }
                            }

                            $item = $('<div class="item'+hasChildren+'"></div>').appendTo($submenu);
                            $item.append('<a href="http://www.xcom-'+site+'.ru/catalog/'+urlkey+'/'+tree[i]['in'][order_node[k][0]].value.name_url+'/" class="black tx13 bold">'+tree[i]['in'][order_node[k][0]].value.name+'</a>');

                            if (hasChildren) {
                                $item.append($children);
                            }
                        }
                    }

                    break;
                }
            }
        });
    }

    $(document).ready(function () {
        createMainMenu('shop');
        createMainMenu('dom');

        createSubmenu('shop');
        createSubmenu('dom');

        handleCatalogNavSiteSwitching();
        handleCatalogNavMainMenu();
        handleCatalogNavSubfoldersMenu();
    });
})(jQuery, document);
