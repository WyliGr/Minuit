import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'api.theater.index': { paramsTuple?: []; params?: {} }
    'api.theaters.index': { paramsTuple?: []; params?: {} }
    'api.poster.show': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'api.theater.index': { paramsTuple?: []; params?: {} }
    'api.theaters.index': { paramsTuple?: []; params?: {} }
    'api.poster.show': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'api.theater.index': { paramsTuple?: []; params?: {} }
    'api.theaters.index': { paramsTuple?: []; params?: {} }
    'api.poster.show': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}