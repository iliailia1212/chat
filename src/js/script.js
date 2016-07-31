require(['jquery','server', 'functions'], function($, socket, chat) {
    /*
     Обработчики события
     */
    $(document).ready(function () {
        //Начальное модальное окно подключения к серверу
        chat.modal('.connect_modal');
        //Авторизация
        chat.form_on('.auth_modal', chat.auth_check);
        //Отправка сообщения
        chat.form_on('.chat-list>.form', function (el) {
            var time = (new Date()).getTime();
            var input = $(el).find('input');
            var text = input.val();
            socket.send({text: text, time: time});
            input.val('');
        });
        $('.add_group').click(function () {
            var name = prompt('Введите имя группы');
            if(typeof name == 'string') socket.add_room(name);
        });
        //Смена цвета панели
        $('.set_color>label').click(function () {
            var color = $(this).find('input').data('id');
            $('body>.container>.panel').attr('class', 'panel panel-' + color);
        });
    });
});
/**
 *
 * SERVER
 *
 * change socket.io to sockjs (https://github.com/sockjs/sockjs-node)
 *
 * make package.json and define dependencies for this project
 *
 * make to dispatchers
 *
 *  1) sockets connections - messages / rooms / ...
 *  2) request-response dispatcher - render template of index page
 *     template engine - ectjs (http://ectjs.com/)
 *
 *
 * CLIENT
 *
 * use requirejs for all client js
 *
 * use gulp for build sass to css
 *
 *
 * CLIENT + SERVER
 *
 * 1) add client storage for user's nickname
 * after reload of page - user must be loginned automaticaly
 *
 *
 * DB
 *
 * 1) extend messages - add id, created, user_id (join table user), rooms_id (join table rooms), message
 *
 * 2) add table for users
 *
 * 3) add table for rooms
 *
 */