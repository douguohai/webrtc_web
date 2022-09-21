FROM nginx:1.17.5-alpine

WORKDIR /usr/share/nginx/html/

#更改时区
RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo 'Asia/Shanghai' >/etc/timezone

COPY build/ /usr/share/nginx/html/