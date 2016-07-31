define(['jquery', 'socket', 'functions', 'EventEmitter','multiplex', 'bootstrap', 'jquery.cookie'], function ($, SockJS, chat, EventEmitter) {
    /*
     Подключение и обработка команд сервера
     */
    var socket_room, room, reconnect = 0, auth_socket_global;
    start();
    function start() {
        var socket = SockJS('http://192.168.1.116:377/chat');
        var multiplexer = new WebSocketMultiplex(socket);
        var auth_socket = multiplexer.channel('auth');
        auth_socket_global = auth_socket;
        var auth = new EventEmitter();

        socket.onerror = function (e) {
            console.error('err', e);
        }
        socket.onclose = function () {
            chat.disconnect(++reconnect);
            setTimeout(start, 2000);
        }
        auth_socket.onmessage = function (data) {
            data = JSON.parse(data.data);
            console.log(data.type, data.data);
            if (data.type) auth.emit(data.type, data.data);
            else console.error('Сообщение без типа!', data);
        }
        auth_socket.onopen = function () {
            reconnect = 0;
            if($.cookie('nick') && $.cookie('nick') != 'false') {
                //$('.inputName').val($.cookie('nick'));
                //chat.auth_check();
                chat.send_socket('auth_id', $.cookie('nick'), auth_socket);
            }
            else {
                chat.modal('.auth_modal');
            }
            chat.modal('.connect_modal', true);
        }
        auth.on('auth', function (data) {
            $.cookie('nick', data.id);
            window.nick = data.nick;
            chat.modal('.auth_modal', true);
            chat.update_users(data.users);
            chat.update_room(data.rooms);
        });
        auth.on('update', function (data) {
            if (data.users) chat.update_users(data.users);
            if (data.rooms) chat.update_room(data.rooms);
        });
        auth.on('auth_err', function (data) {
            chat.modal('.auth_modal');
            alert(data);
        });
        auth.on('alert', function (data) {
            alert(data);
        });


        chat.set_socket({
            auth: function (name) {
                console.log(name);
                //auth_socket.send(JSON.stringify({type: 'auth', data: name}));
                chat.send_socket('auth', name, auth_socket)

            },
            room_disconnect: function (name) {
                console.log('disconnect', name);
                chat.send_socket('disconnect', name, socket_room);
                console.log('room_disconnect', name, JSON.parse('"'+socket_room.name+'"'));
            },
            room_set: function (name, id) {
                console.log('room_set', name);
                socket_room = multiplexer.channel(id);
                room = new EventEmitter();


                socket_room.onmessage = function (data) {
                    data = JSON.parse(data.data);
                    console.log(data.type, data.data);
                    if (data.type) room.emit(data.type, data.data);
                    else console.error('Сообщение без типа!', data);
                }

                room.on('update', function (data) {
                    if (data.users) chat.update_users(data.users);
                    if (data.rooms) chat.update_room(data.rooms);
                });
                room.on('alert', function (data) {
                    alert(data);
                });
                room.on('del_message', function (data) {
                    $('.list-messages tr[data-id="'+data+'"]').remove();
                });
                room.on('room', function (data) {
                    $('.mess_send').removeAttr('disabled');
                    $('.mess_send').parent().parent().find('input').removeAttr('disabled');
                    $('.list-messages').empty();
                    chat.update_users(data.users);
                    console.log(data.chat);
                    for (time in data.chat) {
                        console.log(time,chat.get_date(time));
                        var mess = data.chat[time];
                        chat.add_mess(mess.user_name, mess.message, time, mess.id);
                    }
                    $('.del_message').off('click').click(function () {
                        var id = $(this).parent().parent().data('id');
                        chat.send_socket('del_message', id, socket_room);
                    });
                });
                room.on('message', function (data) {
                    chat.add_mess(data.name, data.text, data.time, data.id);
                    $('.del_message').off('click').click(function () {
                        var id = $(this).parent().parent().data('id');
                        chat.send_socket('del_message', id, socket_room);
                    });
                });

                socket_room.onopen = function () {
                    console.log('connect', name, id);
                    chat.send_socket('connect', id, socket_room);
                }

            }
        });
    }
    return {
        add_room: function (name) {
            console.log('add_room',name);
            chat.send_socket('add_room', name, auth_socket_global)
        },
        send: function (data) {
            chat.send_socket('message', data, socket_room);
        }
    }
});