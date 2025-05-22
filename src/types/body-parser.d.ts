declare module 'body-parser' {
  import { RequestHandler } from 'express'
  
  interface Options {
    inflate?: boolean
    limit?: string | number
    type?: string | string[]
    verify?: (req: any, res: any, buf: Buffer, encoding: string) => void
  }
  
  interface BodyParser {
    json(options?: Options): RequestHandler
    urlencoded(options?: { extended?: boolean } & Options): RequestHandler
    raw(options?: Options): RequestHandler
    text(options?: Options): RequestHandler
  }
  
  const bodyParser: BodyParser
  export = bodyParser
}
