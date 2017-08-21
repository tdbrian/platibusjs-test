import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as _ from 'lodash'

type MessageContext = {
  id: string;
  name: string;
  origination: string;
  contentType: string;
  destination: string;
}

const app = express()
app.use(bodyParser.json({ type: 'application/json' }))
app.use(bodyParser.text({ type: 'text/html' }))
app.use(bodyParser.text({ type: 'text/plain' }))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/platibus', (req, res) => {
  let lines = req.body.split("\n")
  let messageContext = extractMessageContext(lines)
  let firstEmptyLine = _.findIndex(lines, l => l === '\r')
  let content = lines.slice(firstEmptyLine, lines.length).join('')

  let parsedContent = messageContext.contentType === 'application/json'
      ? JSON.parse(content)
      : content

  res.send( {status: 'received', errors: [] })
})

const extractMessageContext = (lines: string[]) => {
  return <MessageContext> {
    id: getMessageContextPart(lines, 'Platibus-MessageId:'),
    name: getMessageContextPart(lines, 'Platibus-MessageName:'),
    origination: getMessageContextPart(lines, 'Platibus-Origination:'),
    contentType: getMessageContextPart(lines, 'Content-Type:'),
    destination: getMessageContextPart(lines, 'Platibus-Destination:')
  }
}

let getMessageContextPart = (body: string[], prefix: string): string => {
  let matchers = body.filter(line => line.indexOf(prefix) > -1);
  if (matchers.length > 0) {
    return matchers[0].replace(prefix, '').trim();
  } else {
    return '';
  }
}

app.listen(3000, () => {
  console.log('Example app listening on http://localhost:3000')
})