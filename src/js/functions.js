define(['jquery', 'moment', 'ect', 'bootstrap'], function($,moment, ECT) {
    var renderer = ECT({ root : '/templates' });
    var socket;
    function set_socket(s) {
        socket = s;
    }
    /*
     Все функции
     */

    /* Функции обработчиков */
//Проверка ника
    function auth_check() {
        var nick = $('.inputName').val();
        if (nick.length <= 2) alert('Ник должен быть длинее 2-х символов!');
        else socket.auth(nick);
    }

//Выбор комнаты
    function room_select() {
        if($(this).is('.active')) return false;
        var old_room = $('.list-rooms>.active');
        if(old_room.length != 0) socket.room_disconnect(old_room.text());
        $('.list-rooms>div').removeClass('active');
        $(this).addClass('active')
        socket.room_set($(this).text(), $(this).data('id'));
    }

    /* Функции сервера */
//Парсинг списка пользователей
    function update_users(list) {
        var users = [];
        list.forEach(function (name) {
            users.push($(renderer.render('list-item.ect', {
                text: name
            })));
        });
        $('.list-users').html(users);
    }

//Парсинг списка комнат
    function update_room(list) {
        var rooms = [];
        for(var name in list) {
            rooms.push($(renderer.render('list-item.ect', {
                text: name,
                id: list[name]
            })).click(room_select));
        }
        $('.list-rooms').html(rooms);
    }

//Отображение сообщения о недоступности сервера
    function disconnect(n) {
        $('.connect_modal .modal-body').text('Сервер не отвечат, попытка подключиться #' + n);
        modal('.connect_modal');
        modal('.auth_modal', true);
    }

    /* Общие функции */
//Функция обработки полей для ввода
    function form_on(el, callback) {
        $(el).keypress(function (e) {
            if (e.which == 13) callback(el);
        });
        $(el).find('button').click(function () {
            callback(el);
        });
    }

//Управление модальными окнами
    function modal(id, hide) {
        if (hide) $(id).modal('hide');
        else $(id).modal({backdrop: 'static', keyboard: false});
    }

//Получение дата в виде строки
    function get_date(time_int) {
        var time = moment(parseInt(time_int));
        if (moment().diff(time, 'days') == 0) return time.format('HH:mm:ss');
        else return time.format('DD.MM.YY');
    }

//Добавление нового сообщения
    function add_mess(name, text, time, id) {
        if (!name || !text) return false;
        if(name == 'Вы' || name == window.nick) {
            name = 'Вы';
            var date = '<span class="del_message">'+get_date(time)+'</span>';
        }
        else var date = get_date(time);
        $('.list-messages').prepend(renderer.render('message.ect', {
            name: name,
            text: text,
            date: date,
            id: id
        }));
    }
    //Отправка данных по socket
    function send_socket(type,data,socket) {
        socket.send(JSON.stringify({type: type, data: data}));
    }
    return {
        add_mess: add_mess,
        get_date: get_date,
        modal: modal,
        form_on: form_on,
        disconnect: disconnect,
        update_room: update_room,
        update_users: update_users,
        room_select: room_select,
        auth_check: auth_check,
        set_socket: set_socket,
        send_socket: send_socket
    };
});