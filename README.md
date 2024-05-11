# GyverHub to Blynk bridge Server  [Pre-Alpha]

<!-- TOC -->
* [GyverHub to Blynk bridge Server  [Pre-Alpha]](#gyverhub-to-blynk-bridge-server-pre-alpha)
  * [Что есть сие](#что-есть-сие)
    * [На данный момент работает](#на-данный-момент-работает)
      * [C точки зрения устройств blynk](#c-точки-зрения-устройств-blynk)
      * [С точки зрения GyverHub](#с-точки-зрения-gyverhub)
    * [Что планируется доделать](#что-планируется-доделать)
  * [Что оно делает](#что-оно-делает-)
  * [Описание протокола Blynk](#описание-протокола-blynk)
  * [Описание протокола обмена данными с приложением GyverHub](#описание-протокола-обмена-данными-с-приложением-gyverhub)
  * [Запуск сервиса](#запуск-сервиса)
      * [Зависимости](#зависимости)
      * [Cборка зависимотей](#cборка-зависимотей)
      * [Запуск](#запуск)
  * [Конфигурирование](#конфигурирование-)
    * [Сервис](#сервис)
      * [Пример настройки с описанием:](#пример-настройки-с-описанием)
    * [Настройка устройств](#настройка-устройств)
      * [Со стороны сервера](#со-стороны-сервера)
      * [Со стороны приложения](#со-стороны-приложения)
<!-- TOC -->

## Что есть сие
Сервис для подключения [GyverHub](https://github.com/GyverLibs/GyverHub) приложений
([web](https://github.com/GyverLibs/GyverHub-web),
[android](https://github.com/GyverLibs/GyverHub-app),
[ios](https://github.com/GyverLibs/GyverHub-app)) 
к устройствам на прошивке [Blynk](https://github.com/BlynkMobile/blynk-library)
</br>
По сути реализует в себе некоторые (**_далеко не все!!!_**) функции,
и [GyverHub](https://github.com/GyverLibs/GyverHub) (прошивки - то что обычно выполняется на устройстве),
и [Blynk-Server](https://github.com/BlynkMobile/blynk-server) сервера управляющего устройствами
</br>
В итоге можно пользоваться устройствами iot типа ESP32, ESP8266 и т.д. 
**без написания прошивки** и вообще, почти, не имея дел с ардуино, если нужно просто дергать пины. Кроме того данное решение не имеет проблем с WebSocket-ми (WS) 
так как девайс не работает с WS, а работает по легковестному бинарному протоколу 
(чтобы было яснее для управления требуется от 5 до 15 байт и ничего не нужно парсить на устройстве!),
а приложение использует сервер с Гигагерцовым процессором (ну то-есть с любым включая всякие там системы на чипе, типа RaspberryPI). В результате 
получилась максимальная стабильность работы и отзывчивость устройств.
</br>
**Проект сделан на тяп-ляп, просто, чтобы проверить концепцию, пока результаты радуют, так что планирую развивать и приводить в порядок код.**

### На данный момент работает

#### C точки зрения устройств blynk
- Создание и поддержание соединения 
- Распределение конфигураций 
- Отправка set команд
- Получение значение пинов с устройств


#### С точки зрения GyverHub
- Добавление и настройка устройств в режиме реального времени (не нужно перезапускать сервис) 
- Можно создавать сколько угодно устройств с Blynk
- В одном устройстве GH может быть сколько угодно контроллеров (управление пинами) с разных железных устройств

### Что планируется доделать
- Добавить команды на чтение пинов из устройства
- Добавить ui для конфигурирования json файла
</br>

## Что оно делает 
При запуске поднимается 2 сервиса: 
- tcp server для подключения устройств с Blynk
- http server для обнаружения устройств приложением GyverHub а так же WebSocket сервис, работает на том же порту 
 

## Описание протокола Blynk
Нормальной документации к сожалению нет, по этому положу сюда то что мне удалось выяснить
### Структура сообщений протокола обмена данными сервера с устройством 

| Команда | Id  сообщения | длинна тела\статус | тело (по сути значения) |
|:-------:|:-------------:|:------------------:|:------------------------:|
| 1 byte  |    2 bytes    |      2 bytes       |         Variable         |

1) Команда кодируется по индексу массива 
```js
    BlynkCmd = [
        "BLYNK_CMD_RESPONSE",
        "BLYNK_CMD_REGISTER",
        "BLYNK_CMD_LOGIN",
        "BLYNK_CMD_SAVE_PROF",
        "BLYNK_CMD_LOAD_PROF",
        "BLYNK_CMD_GET_TOKEN",
        "BLYNK_CMD_PING",
        "BLYNK_CMD_ACTIVATE",
        "BLYNK_CMD_DEACTIVATE",
        "BLYNK_CMD_REFRESH",
        "BLYNK_CMD_GET_GRAPH_DATA",
        "BLYNK_CMD_GET_GRAPH_DATA_RESPONSE",
        "BLYNK_CMD_TWEET",
        "BLYNK_CMD_EMAIL",
        "BLYNK_CMD_NOTIFY",
        "BLYNK_CMD_BRIDGE",
        "BLYNK_CMD_HARDWARE_SYNC",
        "BLYNK_CMD_INTERNAL",
        "BLYNK_CMD_SMS",
        "BLYNK_CMD_PROPERTY",
        "BLYNK_CMD_HARDWARE",
        "BLYNK_CMD_CREATE_DASH",
        "BLYNK_CMD_SAVE_DASH",
        "BLYNK_CMD_DELETE_DASH",
        "BLYNK_CMD_LOAD_PROF_GZ",
        "BLYNK_CMD_SYNC",
        "BLYNK_CMD_SHARING",
        "BLYNK_CMD_ADD_PUSH_TOKEN",
        "NONE",
        //sharing commands
        "BLYNK_CMD_GET_SHARED_DASH",
        "BLYNK_CMD_GET_SHARE_TOKEN",
        "BLYNK_CMD_REFRESH_SHARE_TOKEN",
        "BLYNK_CMD_SHARE_LOGIN",
        "", "", "", "", "", "", "", "",
        "BLYNK_CMD_REDIRECT",
        "", "", "", "", "", "", "", "", "", "", "", "", "",
        "BLYNK_CMD_DEBUG_PRINT",
        "", "", "", "", "", "", "", "",
        "BLYNK_CMD_EVENT_LOG"
    ];
```
2) ID сообщения почти всегда инкрементальные (или иногда статичные), инкремент выдается на соединение (то есть в рамках одного подключения устройства). Работает по циклу от 1 до 255.
3) Длина сообщения которое следует следующим пунктом, похоже нужна для выделения нужного размера массива при разборе    
4) Тело сообщения имеет вид `vw 5 255` в hex `0x7677003500323535` где 
- `v` (`76`) тип пина (v-virtual, d-digital, a-analog)
- `w` (`77`)  операция (w-запись, r-чтение)
- ` ` (`00`) далее идет сегмент с нулями для разделения 1 byte
- `5` (`35`) номер пина GPIO или виртуальный (настраивается в прошивке)
- ` ` (`00`)далее идет сегмент с нулями для разделения 1 byte
- `255` (`323535`) остальное это значение пина
### Порядок подключения устройства к серверу
1) Устройство пытается подключиться к серверу на ip которое у него прописано в прошивке путем отправки такой команды с токеном: 
 `1d000100203131643163383535616239653438353762323365353331386365616430656561`
 - `1d`(hex) = `29`(dec) `BLYNK_CMD_GET_SHARED_DASH` - 30 значение в массиве см. выше
 - `0001`(hex) номер сообщения
 - `0020`(hex) = `32`(dec) длинна сообщения нам передают токен устройства   
 - `3131643163383535616239653438353762323365353331386365616430656561`(hex) = `11d1c855ab9e4857b23e5318cead0eea`(ASCII) - собственно токен 
2) После устройство ожидает ответного сообщения:
В логе сервера это выглядит так
```
[2024-05-11T15:32:34.235] [INFO] onClientTCP - SEND MESS> 10.30.1.203 BLYNK_CMD_GET_SHARED_DASH 00000100c8
[2024-05-11T15:32:34.235] [TRACE] onClientTCP - ---  {"command":"00","id":"0001","length":"00c8","message":""}
```
3) После чего устройство передает информацию о себе вот так
```
[2024-05-11T15:32:32.835] [INFO] onClientTCP - RECEIVED < 10.30.1.203 BLYNK_CMD_INTERNAL 110002004876657200302e362e3100682d6265617400313000627566662d696e0031303234006465760045535038323636006275696c640041707220323120323032342030333a35363a333700
[2024-05-11T15:32:32.835] [TRACE] onClientTCP - ---  {"command":"11","id":"0002","length":"0048","message":"ver\u00000.6.1\u0000h-beat\u000010\u0000buff-in\u00001024\u0000dev\u0000ESP8266\u0000build\u0000Apr 21 2024 03:56:37\u0000"}
```
Уже тут на этом моменте устойсво не будет отключиться, но мы идем дальше 
4) Отправляем на устройство настройки путем отправки в теле всех пинов подряд 
```
[2024-05-11T15:32:32.896] [INFO] onClientTCP - SEND MESS> 10.30.1.203 BLYNK_CMD_HARDWARE_SYNC 14000300067677003100301400030009767700320031303234140003000876770034003235351400030008767700380032323014000300087677003600323535140003000976
7700313000323535
[2024-05-11T15:32:32.896] [TRACE] onClientTCP - ---  {"command":"14","id":"0003","length":"0006","message":"vw\u00001\u00000\u0014\u0000\u0003\u0000\tvw\u00002\u00001024\u0014\u0000\u0003\u0000\bvw\u00004\u0000255\u0014\u0000\u0003\u0
000\bvw\u00008\u0000220\u0014\u0000\u0003\u0000\bvw\u00006\u0000255\u0014\u0000\u0003\u0000\tvw\u000010\u0000255"}
```
5) после начинается обмен пингами раз в 10 секуд
```
[2024-05-11T15:54:30.358] [INFO] onClientTCP - RECEIVED < 10.30.1.203 BLYNK_CMD_PING 0600040000
[2024-05-11T15:54:30.359] [TRACE] onClientTCP - ---  {"command":"06","id":"0004","length":"0000","message":""}
[2024-05-11T15:54:30.359] [INFO] onClientTCP - SEND MESS> 10.30.1.203 BLYNK_CMD_PING 00000400c8
[2024-05-11T15:54:30.359] [TRACE] onClientTCP - ---  {"command":"00","id":"0004","length":"00c8","message":""}
```
6) далее можно отправлять команды на управление 
```
[2024-05-11T16:01:49.993] [INFO] setDeviceValue - SEND VALUE BLYNK_CMD_HARDWARE 10.30.0.201 1400050006767700330031
[2024-05-11T16:01:49.993] [TRACE] setDeviceValue - ---  {"command":"14","id":"0005","length":"0006","message":"vw\u00003\u00001"}
```
Вот в принципе и всё что я знаю, в изысканиях хочется выказать благодарность приложению [Wireshark ](https://www.wireshark.org/download.html) ☉ ‿ ⚆
## Описание протокола обмена данными с приложением GyverHub
TODO
## Запуск сервиса
#### Зависимости
- ОС не имеет значения Linux\Windows\Mac 
- nodejs : ^v8.17.0
- npm
  - "fs": "0.0.1-security"
  - "log4js": "^6.9.1"
  - "node": "^22.1.0"
  - "ws": "^8.17.0"
  - "read-appsettings-json": "^1.0.98"


#### Сборка зависимостей
`npm install`
#### Запуск
`node ./index.js`
## Конфигурирование 
### Сервис
Сам сервис конфигурируется файлом appsettings.json в корне проекта
#### Пример настройки с описанием:
```json
{
  "log":{
    "level": "trace" // уровень логирования (error,info,trace)
  },
  "blynk": {
    "tcp_port" : "8080", // порт на который настроены устройства с blynk 
    "tcp_host" : "10.30.0.16" // хост на который настроены устройства с blynk
  },
  "gh" : {
    "http_port":  "8081", // порт на который будет стучаться приложение GyverHub (http и ws)
    "http_host" : "10.30.0.16" // хост на который будет стучаться приложение GyverHub (http и ws)
  }
}
```
### Настройка устройств
#### Со стороны сервера
TODO
#### Со стороны приложения
TODO




