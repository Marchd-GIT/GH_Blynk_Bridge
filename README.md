# GyverHub to Blynk bridge Server  [Pre-Alpha]



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
- Отправка пишущих команд 

#### С точки зрения GyverHub
- Добавление и настройка устройтв в режиме реального времени (не нжно перезапускать сервис) 
- Можно создавать сколько угодно устройтв с Blynk
- В одном устройстве GH может быть сколько угодно контроллеров (управление пинами) с разных железных устройств

### Что планируется доделать
- Добавить чтение данных с устройств
- Добавить ui для конфигурирования json файла
</br>

## Что оно делает 
При запуске поднимается 3 сервиса: 
- tcp server для подключения устройств с Blynk
- http server для обнаружения устройств приложением GyverHub 
- ws serevr для оперативного управления устройствами 

## Описание протокола Blynk
TODO
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


#### Cборка зависимотей
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




