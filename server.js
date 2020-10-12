const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const app = new Koa();
const uuid = require('uuid');

app.use(async (ctx, next) => {
  const origin = ctx.request.get('Origin');
  if (!origin) {
    return await next();
  }

  const headers = { 'Access-Control-Allow-Origin': '*', };

  if (ctx.request.method !== 'OPTIONS') {
    ctx.response.set({...headers});
    try {
      return await next();
    } catch (e) {
      e.headers = {...e.headers, ...headers};
      throw e;
    }
  }

  if (ctx.request.get('Access-Control-Request-Method')) {
    ctx.response.set({
      ...headers,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
    });

    if (ctx.request.get('Access-Control-Request-Headers')) {
      ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Request-Headers'));
    }

    ctx.response.status = 204;
  }
});

app.use(koaBody({
  urlencoded: true,
  multipart: true,
}));

let tickets = [{
  id: 20,
  name: 'Сделать домашнее задание',
  description: 'Домашнее задание по лекции HTTP-сервер',
  status: false,
  created: '12.10.2020'
},
{
  id: 30,
  name: 'Заплатить за квартиру',
  description: 'Заплатить за июнь и июль',
  status: false,
  created: '12.10.2020'
}];

class TicketFull {
  constructor(name, description) {
    this.id = uuid.v4();
    this.name = name;
    this.description = description;
    this.status = false;
    this.created = initDate();
  }
}

function initDate() {
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear().toString().slice(2);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${day < 10 ? '0' : ''}${day}.${month < 10 ? '0' : ''}${month}.${year} ${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
}

app.use(async (ctx) => {
  const { method } = ctx.request.query;
  const { id, status } = ctx.request.query;

  switch (method) {
    case 'allTickets':
      ctx.response.body = tickets;
      return;
    case 'ticketById':
      const ticket = tickets.filter((item) => item.id === id);
      ctx.response.body = ticket[0].description;
      return;
    case 'toggleStatus':
      const item = tickets.findIndex((item) => item.id === Number(id));
      tickets[item].status = status === 'true' ? true : false;
      ctx.response.body = 'ok';
      return;
    case 'deleteTicket':
      tickets = tickets.filter((item) => item.id !== Number(id));
      ctx.response.body = 'ok';
      return;
    case 'createTicket':
      //Вот тут работает метод POST и деструктуризация не происходит почему-то
      const { name, description } = ctx.request.body;
      console.log(ctx.request.body)
      console.log(name);
      tickets.push(new TicketFull(name, description));
      ctx.response.body = tickets;
      return;
    default:
      ctx.response.status = 404;
  }
});

http.createServer(app.callback()).listen(7070);
