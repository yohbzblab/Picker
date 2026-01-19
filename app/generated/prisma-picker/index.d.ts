
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model influencer
 * 
 */
export type influencer = $Result.DefaultSelection<Prisma.$influencerPayload>
/**
 * Model instagram_keyword_cache
 * 
 */
export type instagram_keyword_cache = $Result.DefaultSelection<Prisma.$instagram_keyword_cachePayload>
/**
 * Model instagram_posts
 * 
 */
export type instagram_posts = $Result.DefaultSelection<Prisma.$instagram_postsPayload>
/**
 * Model instagram_profiles
 * 
 */
export type instagram_profiles = $Result.DefaultSelection<Prisma.$instagram_profilesPayload>
/**
 * Model sync_state
 * 
 */
export type sync_state = $Result.DefaultSelection<Prisma.$sync_statePayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Influencers
 * const influencers = await prisma.influencer.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Influencers
   * const influencers = await prisma.influencer.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.influencer`: Exposes CRUD operations for the **influencer** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Influencers
    * const influencers = await prisma.influencer.findMany()
    * ```
    */
  get influencer(): Prisma.influencerDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.instagram_keyword_cache`: Exposes CRUD operations for the **instagram_keyword_cache** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Instagram_keyword_caches
    * const instagram_keyword_caches = await prisma.instagram_keyword_cache.findMany()
    * ```
    */
  get instagram_keyword_cache(): Prisma.instagram_keyword_cacheDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.instagram_posts`: Exposes CRUD operations for the **instagram_posts** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Instagram_posts
    * const instagram_posts = await prisma.instagram_posts.findMany()
    * ```
    */
  get instagram_posts(): Prisma.instagram_postsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.instagram_profiles`: Exposes CRUD operations for the **instagram_profiles** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Instagram_profiles
    * const instagram_profiles = await prisma.instagram_profiles.findMany()
    * ```
    */
  get instagram_profiles(): Prisma.instagram_profilesDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.sync_state`: Exposes CRUD operations for the **sync_state** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Sync_states
    * const sync_states = await prisma.sync_state.findMany()
    * ```
    */
  get sync_state(): Prisma.sync_stateDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.17.0
   * Query Engine version: c0aafc03b8ef6cdced8654b9a817999e02457d6a
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    influencer: 'influencer',
    instagram_keyword_cache: 'instagram_keyword_cache',
    instagram_posts: 'instagram_posts',
    instagram_profiles: 'instagram_profiles',
    sync_state: 'sync_state'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "influencer" | "instagram_keyword_cache" | "instagram_posts" | "instagram_profiles" | "sync_state"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      influencer: {
        payload: Prisma.$influencerPayload<ExtArgs>
        fields: Prisma.influencerFieldRefs
        operations: {
          findUnique: {
            args: Prisma.influencerFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$influencerPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.influencerFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$influencerPayload>
          }
          findFirst: {
            args: Prisma.influencerFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$influencerPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.influencerFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$influencerPayload>
          }
          findMany: {
            args: Prisma.influencerFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$influencerPayload>[]
          }
          create: {
            args: Prisma.influencerCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$influencerPayload>
          }
          createMany: {
            args: Prisma.influencerCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.influencerCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$influencerPayload>[]
          }
          delete: {
            args: Prisma.influencerDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$influencerPayload>
          }
          update: {
            args: Prisma.influencerUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$influencerPayload>
          }
          deleteMany: {
            args: Prisma.influencerDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.influencerUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.influencerUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$influencerPayload>[]
          }
          upsert: {
            args: Prisma.influencerUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$influencerPayload>
          }
          aggregate: {
            args: Prisma.InfluencerAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInfluencer>
          }
          groupBy: {
            args: Prisma.influencerGroupByArgs<ExtArgs>
            result: $Utils.Optional<InfluencerGroupByOutputType>[]
          }
          count: {
            args: Prisma.influencerCountArgs<ExtArgs>
            result: $Utils.Optional<InfluencerCountAggregateOutputType> | number
          }
        }
      }
      instagram_keyword_cache: {
        payload: Prisma.$instagram_keyword_cachePayload<ExtArgs>
        fields: Prisma.instagram_keyword_cacheFieldRefs
        operations: {
          findUnique: {
            args: Prisma.instagram_keyword_cacheFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$instagram_keyword_cachePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.instagram_keyword_cacheFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$instagram_keyword_cachePayload>
          }
          findFirst: {
            args: Prisma.instagram_keyword_cacheFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$instagram_keyword_cachePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.instagram_keyword_cacheFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$instagram_keyword_cachePayload>
          }
          findMany: {
            args: Prisma.instagram_keyword_cacheFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$instagram_keyword_cachePayload>[]
          }
          create: {
            args: Prisma.instagram_keyword_cacheCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$instagram_keyword_cachePayload>
          }
          createMany: {
            args: Prisma.instagram_keyword_cacheCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.instagram_keyword_cacheCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$instagram_keyword_cachePayload>[]
          }
          delete: {
            args: Prisma.instagram_keyword_cacheDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$instagram_keyword_cachePayload>
          }
          update: {
            args: Prisma.instagram_keyword_cacheUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$instagram_keyword_cachePayload>
          }
          deleteMany: {
            args: Prisma.instagram_keyword_cacheDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.instagram_keyword_cacheUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.instagram_keyword_cacheUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$instagram_keyword_cachePayload>[]
          }
          upsert: {
            args: Prisma.instagram_keyword_cacheUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$instagram_keyword_cachePayload>
          }
          aggregate: {
            args: Prisma.Instagram_keyword_cacheAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInstagram_keyword_cache>
          }
          groupBy: {
            args: Prisma.instagram_keyword_cacheGroupByArgs<ExtArgs>
            result: $Utils.Optional<Instagram_keyword_cacheGroupByOutputType>[]
          }
          count: {
            args: Prisma.instagram_keyword_cacheCountArgs<ExtArgs>
            result: $Utils.Optional<Instagram_keyword_cacheCountAggregateOutputType> | number
          }
        }
      }
      instagram_posts: {
        payload: Prisma.$instagram_postsPayload<ExtArgs>
        fields: Prisma.instagram_postsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.instagram_postsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$instagram_postsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.instagram_postsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$instagram_postsPayload>
          }
          findFirst: {
            args: Prisma.instagram_postsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$instagram_postsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.instagram_postsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$instagram_postsPayload>
          }
          findMany: {
            args: Prisma.instagram_postsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$instagram_postsPayload>[]
          }
          create: {
            args: Prisma.instagram_postsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$instagram_postsPayload>
          }
          createMany: {
            args: Prisma.instagram_postsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.instagram_postsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$instagram_postsPayload>[]
          }
          delete: {
            args: Prisma.instagram_postsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$instagram_postsPayload>
          }
          update: {
            args: Prisma.instagram_postsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$instagram_postsPayload>
          }
          deleteMany: {
            args: Prisma.instagram_postsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.instagram_postsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.instagram_postsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$instagram_postsPayload>[]
          }
          upsert: {
            args: Prisma.instagram_postsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$instagram_postsPayload>
          }
          aggregate: {
            args: Prisma.Instagram_postsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInstagram_posts>
          }
          groupBy: {
            args: Prisma.instagram_postsGroupByArgs<ExtArgs>
            result: $Utils.Optional<Instagram_postsGroupByOutputType>[]
          }
          count: {
            args: Prisma.instagram_postsCountArgs<ExtArgs>
            result: $Utils.Optional<Instagram_postsCountAggregateOutputType> | number
          }
        }
      }
      instagram_profiles: {
        payload: Prisma.$instagram_profilesPayload<ExtArgs>
        fields: Prisma.instagram_profilesFieldRefs
        operations: {
          findUnique: {
            args: Prisma.instagram_profilesFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$instagram_profilesPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.instagram_profilesFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$instagram_profilesPayload>
          }
          findFirst: {
            args: Prisma.instagram_profilesFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$instagram_profilesPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.instagram_profilesFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$instagram_profilesPayload>
          }
          findMany: {
            args: Prisma.instagram_profilesFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$instagram_profilesPayload>[]
          }
          create: {
            args: Prisma.instagram_profilesCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$instagram_profilesPayload>
          }
          createMany: {
            args: Prisma.instagram_profilesCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.instagram_profilesCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$instagram_profilesPayload>[]
          }
          delete: {
            args: Prisma.instagram_profilesDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$instagram_profilesPayload>
          }
          update: {
            args: Prisma.instagram_profilesUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$instagram_profilesPayload>
          }
          deleteMany: {
            args: Prisma.instagram_profilesDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.instagram_profilesUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.instagram_profilesUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$instagram_profilesPayload>[]
          }
          upsert: {
            args: Prisma.instagram_profilesUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$instagram_profilesPayload>
          }
          aggregate: {
            args: Prisma.Instagram_profilesAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInstagram_profiles>
          }
          groupBy: {
            args: Prisma.instagram_profilesGroupByArgs<ExtArgs>
            result: $Utils.Optional<Instagram_profilesGroupByOutputType>[]
          }
          count: {
            args: Prisma.instagram_profilesCountArgs<ExtArgs>
            result: $Utils.Optional<Instagram_profilesCountAggregateOutputType> | number
          }
        }
      }
      sync_state: {
        payload: Prisma.$sync_statePayload<ExtArgs>
        fields: Prisma.sync_stateFieldRefs
        operations: {
          findUnique: {
            args: Prisma.sync_stateFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sync_statePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.sync_stateFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sync_statePayload>
          }
          findFirst: {
            args: Prisma.sync_stateFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sync_statePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.sync_stateFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sync_statePayload>
          }
          findMany: {
            args: Prisma.sync_stateFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sync_statePayload>[]
          }
          create: {
            args: Prisma.sync_stateCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sync_statePayload>
          }
          createMany: {
            args: Prisma.sync_stateCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.sync_stateCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sync_statePayload>[]
          }
          delete: {
            args: Prisma.sync_stateDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sync_statePayload>
          }
          update: {
            args: Prisma.sync_stateUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sync_statePayload>
          }
          deleteMany: {
            args: Prisma.sync_stateDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.sync_stateUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.sync_stateUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sync_statePayload>[]
          }
          upsert: {
            args: Prisma.sync_stateUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$sync_statePayload>
          }
          aggregate: {
            args: Prisma.Sync_stateAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSync_state>
          }
          groupBy: {
            args: Prisma.sync_stateGroupByArgs<ExtArgs>
            result: $Utils.Optional<Sync_stateGroupByOutputType>[]
          }
          count: {
            args: Prisma.sync_stateCountArgs<ExtArgs>
            result: $Utils.Optional<Sync_stateCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    influencer?: influencerOmit
    instagram_keyword_cache?: instagram_keyword_cacheOmit
    instagram_posts?: instagram_postsOmit
    instagram_profiles?: instagram_profilesOmit
    sync_state?: sync_stateOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */



  /**
   * Models
   */

  /**
   * Model influencer
   */

  export type AggregateInfluencer = {
    _count: InfluencerCountAggregateOutputType | null
    _avg: InfluencerAvgAggregateOutputType | null
    _sum: InfluencerSumAggregateOutputType | null
    _min: InfluencerMinAggregateOutputType | null
    _max: InfluencerMaxAggregateOutputType | null
  }

  export type InfluencerAvgAggregateOutputType = {
    accountId: number | null
    followers: number | null
    recentAvgViews: number | null
    pinnedAvgViews: number | null
    recent18AvgViews: number | null
    priority_score: number | null
    update_interval_minutes: number | null
  }

  export type InfluencerSumAggregateOutputType = {
    accountId: bigint | null
    followers: bigint | null
    recentAvgViews: bigint | null
    pinnedAvgViews: bigint | null
    recent18AvgViews: bigint | null
    priority_score: number | null
    update_interval_minutes: number | null
  }

  export type InfluencerMinAggregateOutputType = {
    username: string | null
    accountId: bigint | null
    email: string | null
    name: string | null
    bio: string | null
    followers: bigint | null
    ageGroup: string | null
    profileLink: string | null
    categories: string | null
    hasLinks: boolean | null
    uploadFreq: string | null
    recentAvgViews: bigint | null
    captureLinks: string | null
    pinnedAvgViews: bigint | null
    recent18AvgViews: bigint | null
    recentAds: string | null
    contactMethod: string | null
    updated_at: Date | null
    platform: string | null
    priority_score: number | null
    priority_tier: string | null
    track_history: boolean | null
    update_interval_minutes: number | null
  }

  export type InfluencerMaxAggregateOutputType = {
    username: string | null
    accountId: bigint | null
    email: string | null
    name: string | null
    bio: string | null
    followers: bigint | null
    ageGroup: string | null
    profileLink: string | null
    categories: string | null
    hasLinks: boolean | null
    uploadFreq: string | null
    recentAvgViews: bigint | null
    captureLinks: string | null
    pinnedAvgViews: bigint | null
    recent18AvgViews: bigint | null
    recentAds: string | null
    contactMethod: string | null
    updated_at: Date | null
    platform: string | null
    priority_score: number | null
    priority_tier: string | null
    track_history: boolean | null
    update_interval_minutes: number | null
  }

  export type InfluencerCountAggregateOutputType = {
    username: number
    accountId: number
    email: number
    name: number
    bio: number
    followers: number
    ageGroup: number
    profileLink: number
    categories: number
    hasLinks: number
    uploadFreq: number
    recentAvgViews: number
    captureLinks: number
    pinnedAvgViews: number
    recent18AvgViews: number
    recentAds: number
    contactMethod: number
    updated_at: number
    platform: number
    priority_score: number
    priority_tier: number
    track_history: number
    update_interval_minutes: number
    _all: number
  }


  export type InfluencerAvgAggregateInputType = {
    accountId?: true
    followers?: true
    recentAvgViews?: true
    pinnedAvgViews?: true
    recent18AvgViews?: true
    priority_score?: true
    update_interval_minutes?: true
  }

  export type InfluencerSumAggregateInputType = {
    accountId?: true
    followers?: true
    recentAvgViews?: true
    pinnedAvgViews?: true
    recent18AvgViews?: true
    priority_score?: true
    update_interval_minutes?: true
  }

  export type InfluencerMinAggregateInputType = {
    username?: true
    accountId?: true
    email?: true
    name?: true
    bio?: true
    followers?: true
    ageGroup?: true
    profileLink?: true
    categories?: true
    hasLinks?: true
    uploadFreq?: true
    recentAvgViews?: true
    captureLinks?: true
    pinnedAvgViews?: true
    recent18AvgViews?: true
    recentAds?: true
    contactMethod?: true
    updated_at?: true
    platform?: true
    priority_score?: true
    priority_tier?: true
    track_history?: true
    update_interval_minutes?: true
  }

  export type InfluencerMaxAggregateInputType = {
    username?: true
    accountId?: true
    email?: true
    name?: true
    bio?: true
    followers?: true
    ageGroup?: true
    profileLink?: true
    categories?: true
    hasLinks?: true
    uploadFreq?: true
    recentAvgViews?: true
    captureLinks?: true
    pinnedAvgViews?: true
    recent18AvgViews?: true
    recentAds?: true
    contactMethod?: true
    updated_at?: true
    platform?: true
    priority_score?: true
    priority_tier?: true
    track_history?: true
    update_interval_minutes?: true
  }

  export type InfluencerCountAggregateInputType = {
    username?: true
    accountId?: true
    email?: true
    name?: true
    bio?: true
    followers?: true
    ageGroup?: true
    profileLink?: true
    categories?: true
    hasLinks?: true
    uploadFreq?: true
    recentAvgViews?: true
    captureLinks?: true
    pinnedAvgViews?: true
    recent18AvgViews?: true
    recentAds?: true
    contactMethod?: true
    updated_at?: true
    platform?: true
    priority_score?: true
    priority_tier?: true
    track_history?: true
    update_interval_minutes?: true
    _all?: true
  }

  export type InfluencerAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which influencer to aggregate.
     */
    where?: influencerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of influencers to fetch.
     */
    orderBy?: influencerOrderByWithRelationInput | influencerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: influencerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` influencers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` influencers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned influencers
    **/
    _count?: true | InfluencerCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: InfluencerAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: InfluencerSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InfluencerMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InfluencerMaxAggregateInputType
  }

  export type GetInfluencerAggregateType<T extends InfluencerAggregateArgs> = {
        [P in keyof T & keyof AggregateInfluencer]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInfluencer[P]>
      : GetScalarType<T[P], AggregateInfluencer[P]>
  }




  export type influencerGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: influencerWhereInput
    orderBy?: influencerOrderByWithAggregationInput | influencerOrderByWithAggregationInput[]
    by: InfluencerScalarFieldEnum[] | InfluencerScalarFieldEnum
    having?: influencerScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InfluencerCountAggregateInputType | true
    _avg?: InfluencerAvgAggregateInputType
    _sum?: InfluencerSumAggregateInputType
    _min?: InfluencerMinAggregateInputType
    _max?: InfluencerMaxAggregateInputType
  }

  export type InfluencerGroupByOutputType = {
    username: string
    accountId: bigint | null
    email: string | null
    name: string | null
    bio: string | null
    followers: bigint | null
    ageGroup: string | null
    profileLink: string | null
    categories: string | null
    hasLinks: boolean | null
    uploadFreq: string | null
    recentAvgViews: bigint | null
    captureLinks: string | null
    pinnedAvgViews: bigint | null
    recent18AvgViews: bigint | null
    recentAds: string | null
    contactMethod: string | null
    updated_at: Date | null
    platform: string
    priority_score: number | null
    priority_tier: string | null
    track_history: boolean | null
    update_interval_minutes: number | null
    _count: InfluencerCountAggregateOutputType | null
    _avg: InfluencerAvgAggregateOutputType | null
    _sum: InfluencerSumAggregateOutputType | null
    _min: InfluencerMinAggregateOutputType | null
    _max: InfluencerMaxAggregateOutputType | null
  }

  type GetInfluencerGroupByPayload<T extends influencerGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InfluencerGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InfluencerGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InfluencerGroupByOutputType[P]>
            : GetScalarType<T[P], InfluencerGroupByOutputType[P]>
        }
      >
    >


  export type influencerSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    username?: boolean
    accountId?: boolean
    email?: boolean
    name?: boolean
    bio?: boolean
    followers?: boolean
    ageGroup?: boolean
    profileLink?: boolean
    categories?: boolean
    hasLinks?: boolean
    uploadFreq?: boolean
    recentAvgViews?: boolean
    captureLinks?: boolean
    pinnedAvgViews?: boolean
    recent18AvgViews?: boolean
    recentAds?: boolean
    contactMethod?: boolean
    updated_at?: boolean
    platform?: boolean
    priority_score?: boolean
    priority_tier?: boolean
    track_history?: boolean
    update_interval_minutes?: boolean
  }, ExtArgs["result"]["influencer"]>

  export type influencerSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    username?: boolean
    accountId?: boolean
    email?: boolean
    name?: boolean
    bio?: boolean
    followers?: boolean
    ageGroup?: boolean
    profileLink?: boolean
    categories?: boolean
    hasLinks?: boolean
    uploadFreq?: boolean
    recentAvgViews?: boolean
    captureLinks?: boolean
    pinnedAvgViews?: boolean
    recent18AvgViews?: boolean
    recentAds?: boolean
    contactMethod?: boolean
    updated_at?: boolean
    platform?: boolean
    priority_score?: boolean
    priority_tier?: boolean
    track_history?: boolean
    update_interval_minutes?: boolean
  }, ExtArgs["result"]["influencer"]>

  export type influencerSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    username?: boolean
    accountId?: boolean
    email?: boolean
    name?: boolean
    bio?: boolean
    followers?: boolean
    ageGroup?: boolean
    profileLink?: boolean
    categories?: boolean
    hasLinks?: boolean
    uploadFreq?: boolean
    recentAvgViews?: boolean
    captureLinks?: boolean
    pinnedAvgViews?: boolean
    recent18AvgViews?: boolean
    recentAds?: boolean
    contactMethod?: boolean
    updated_at?: boolean
    platform?: boolean
    priority_score?: boolean
    priority_tier?: boolean
    track_history?: boolean
    update_interval_minutes?: boolean
  }, ExtArgs["result"]["influencer"]>

  export type influencerSelectScalar = {
    username?: boolean
    accountId?: boolean
    email?: boolean
    name?: boolean
    bio?: boolean
    followers?: boolean
    ageGroup?: boolean
    profileLink?: boolean
    categories?: boolean
    hasLinks?: boolean
    uploadFreq?: boolean
    recentAvgViews?: boolean
    captureLinks?: boolean
    pinnedAvgViews?: boolean
    recent18AvgViews?: boolean
    recentAds?: boolean
    contactMethod?: boolean
    updated_at?: boolean
    platform?: boolean
    priority_score?: boolean
    priority_tier?: boolean
    track_history?: boolean
    update_interval_minutes?: boolean
  }

  export type influencerOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"username" | "accountId" | "email" | "name" | "bio" | "followers" | "ageGroup" | "profileLink" | "categories" | "hasLinks" | "uploadFreq" | "recentAvgViews" | "captureLinks" | "pinnedAvgViews" | "recent18AvgViews" | "recentAds" | "contactMethod" | "updated_at" | "platform" | "priority_score" | "priority_tier" | "track_history" | "update_interval_minutes", ExtArgs["result"]["influencer"]>

  export type $influencerPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "influencer"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      username: string
      accountId: bigint | null
      email: string | null
      name: string | null
      bio: string | null
      followers: bigint | null
      ageGroup: string | null
      profileLink: string | null
      categories: string | null
      hasLinks: boolean | null
      uploadFreq: string | null
      recentAvgViews: bigint | null
      captureLinks: string | null
      pinnedAvgViews: bigint | null
      recent18AvgViews: bigint | null
      recentAds: string | null
      contactMethod: string | null
      updated_at: Date | null
      platform: string
      priority_score: number | null
      priority_tier: string | null
      track_history: boolean | null
      update_interval_minutes: number | null
    }, ExtArgs["result"]["influencer"]>
    composites: {}
  }

  type influencerGetPayload<S extends boolean | null | undefined | influencerDefaultArgs> = $Result.GetResult<Prisma.$influencerPayload, S>

  type influencerCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<influencerFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: InfluencerCountAggregateInputType | true
    }

  export interface influencerDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['influencer'], meta: { name: 'influencer' } }
    /**
     * Find zero or one Influencer that matches the filter.
     * @param {influencerFindUniqueArgs} args - Arguments to find a Influencer
     * @example
     * // Get one Influencer
     * const influencer = await prisma.influencer.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends influencerFindUniqueArgs>(args: SelectSubset<T, influencerFindUniqueArgs<ExtArgs>>): Prisma__influencerClient<$Result.GetResult<Prisma.$influencerPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Influencer that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {influencerFindUniqueOrThrowArgs} args - Arguments to find a Influencer
     * @example
     * // Get one Influencer
     * const influencer = await prisma.influencer.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends influencerFindUniqueOrThrowArgs>(args: SelectSubset<T, influencerFindUniqueOrThrowArgs<ExtArgs>>): Prisma__influencerClient<$Result.GetResult<Prisma.$influencerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Influencer that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {influencerFindFirstArgs} args - Arguments to find a Influencer
     * @example
     * // Get one Influencer
     * const influencer = await prisma.influencer.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends influencerFindFirstArgs>(args?: SelectSubset<T, influencerFindFirstArgs<ExtArgs>>): Prisma__influencerClient<$Result.GetResult<Prisma.$influencerPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Influencer that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {influencerFindFirstOrThrowArgs} args - Arguments to find a Influencer
     * @example
     * // Get one Influencer
     * const influencer = await prisma.influencer.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends influencerFindFirstOrThrowArgs>(args?: SelectSubset<T, influencerFindFirstOrThrowArgs<ExtArgs>>): Prisma__influencerClient<$Result.GetResult<Prisma.$influencerPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Influencers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {influencerFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Influencers
     * const influencers = await prisma.influencer.findMany()
     * 
     * // Get first 10 Influencers
     * const influencers = await prisma.influencer.findMany({ take: 10 })
     * 
     * // Only select the `username`
     * const influencerWithUsernameOnly = await prisma.influencer.findMany({ select: { username: true } })
     * 
     */
    findMany<T extends influencerFindManyArgs>(args?: SelectSubset<T, influencerFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$influencerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Influencer.
     * @param {influencerCreateArgs} args - Arguments to create a Influencer.
     * @example
     * // Create one Influencer
     * const Influencer = await prisma.influencer.create({
     *   data: {
     *     // ... data to create a Influencer
     *   }
     * })
     * 
     */
    create<T extends influencerCreateArgs>(args: SelectSubset<T, influencerCreateArgs<ExtArgs>>): Prisma__influencerClient<$Result.GetResult<Prisma.$influencerPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Influencers.
     * @param {influencerCreateManyArgs} args - Arguments to create many Influencers.
     * @example
     * // Create many Influencers
     * const influencer = await prisma.influencer.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends influencerCreateManyArgs>(args?: SelectSubset<T, influencerCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Influencers and returns the data saved in the database.
     * @param {influencerCreateManyAndReturnArgs} args - Arguments to create many Influencers.
     * @example
     * // Create many Influencers
     * const influencer = await prisma.influencer.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Influencers and only return the `username`
     * const influencerWithUsernameOnly = await prisma.influencer.createManyAndReturn({
     *   select: { username: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends influencerCreateManyAndReturnArgs>(args?: SelectSubset<T, influencerCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$influencerPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Influencer.
     * @param {influencerDeleteArgs} args - Arguments to delete one Influencer.
     * @example
     * // Delete one Influencer
     * const Influencer = await prisma.influencer.delete({
     *   where: {
     *     // ... filter to delete one Influencer
     *   }
     * })
     * 
     */
    delete<T extends influencerDeleteArgs>(args: SelectSubset<T, influencerDeleteArgs<ExtArgs>>): Prisma__influencerClient<$Result.GetResult<Prisma.$influencerPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Influencer.
     * @param {influencerUpdateArgs} args - Arguments to update one Influencer.
     * @example
     * // Update one Influencer
     * const influencer = await prisma.influencer.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends influencerUpdateArgs>(args: SelectSubset<T, influencerUpdateArgs<ExtArgs>>): Prisma__influencerClient<$Result.GetResult<Prisma.$influencerPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Influencers.
     * @param {influencerDeleteManyArgs} args - Arguments to filter Influencers to delete.
     * @example
     * // Delete a few Influencers
     * const { count } = await prisma.influencer.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends influencerDeleteManyArgs>(args?: SelectSubset<T, influencerDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Influencers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {influencerUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Influencers
     * const influencer = await prisma.influencer.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends influencerUpdateManyArgs>(args: SelectSubset<T, influencerUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Influencers and returns the data updated in the database.
     * @param {influencerUpdateManyAndReturnArgs} args - Arguments to update many Influencers.
     * @example
     * // Update many Influencers
     * const influencer = await prisma.influencer.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Influencers and only return the `username`
     * const influencerWithUsernameOnly = await prisma.influencer.updateManyAndReturn({
     *   select: { username: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends influencerUpdateManyAndReturnArgs>(args: SelectSubset<T, influencerUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$influencerPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Influencer.
     * @param {influencerUpsertArgs} args - Arguments to update or create a Influencer.
     * @example
     * // Update or create a Influencer
     * const influencer = await prisma.influencer.upsert({
     *   create: {
     *     // ... data to create a Influencer
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Influencer we want to update
     *   }
     * })
     */
    upsert<T extends influencerUpsertArgs>(args: SelectSubset<T, influencerUpsertArgs<ExtArgs>>): Prisma__influencerClient<$Result.GetResult<Prisma.$influencerPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Influencers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {influencerCountArgs} args - Arguments to filter Influencers to count.
     * @example
     * // Count the number of Influencers
     * const count = await prisma.influencer.count({
     *   where: {
     *     // ... the filter for the Influencers we want to count
     *   }
     * })
    **/
    count<T extends influencerCountArgs>(
      args?: Subset<T, influencerCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InfluencerCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Influencer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InfluencerAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends InfluencerAggregateArgs>(args: Subset<T, InfluencerAggregateArgs>): Prisma.PrismaPromise<GetInfluencerAggregateType<T>>

    /**
     * Group by Influencer.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {influencerGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends influencerGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: influencerGroupByArgs['orderBy'] }
        : { orderBy?: influencerGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, influencerGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInfluencerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the influencer model
   */
  readonly fields: influencerFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for influencer.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__influencerClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the influencer model
   */
  interface influencerFieldRefs {
    readonly username: FieldRef<"influencer", 'String'>
    readonly accountId: FieldRef<"influencer", 'BigInt'>
    readonly email: FieldRef<"influencer", 'String'>
    readonly name: FieldRef<"influencer", 'String'>
    readonly bio: FieldRef<"influencer", 'String'>
    readonly followers: FieldRef<"influencer", 'BigInt'>
    readonly ageGroup: FieldRef<"influencer", 'String'>
    readonly profileLink: FieldRef<"influencer", 'String'>
    readonly categories: FieldRef<"influencer", 'String'>
    readonly hasLinks: FieldRef<"influencer", 'Boolean'>
    readonly uploadFreq: FieldRef<"influencer", 'String'>
    readonly recentAvgViews: FieldRef<"influencer", 'BigInt'>
    readonly captureLinks: FieldRef<"influencer", 'String'>
    readonly pinnedAvgViews: FieldRef<"influencer", 'BigInt'>
    readonly recent18AvgViews: FieldRef<"influencer", 'BigInt'>
    readonly recentAds: FieldRef<"influencer", 'String'>
    readonly contactMethod: FieldRef<"influencer", 'String'>
    readonly updated_at: FieldRef<"influencer", 'DateTime'>
    readonly platform: FieldRef<"influencer", 'String'>
    readonly priority_score: FieldRef<"influencer", 'Int'>
    readonly priority_tier: FieldRef<"influencer", 'String'>
    readonly track_history: FieldRef<"influencer", 'Boolean'>
    readonly update_interval_minutes: FieldRef<"influencer", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * influencer findUnique
   */
  export type influencerFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the influencer
     */
    select?: influencerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the influencer
     */
    omit?: influencerOmit<ExtArgs> | null
    /**
     * Filter, which influencer to fetch.
     */
    where: influencerWhereUniqueInput
  }

  /**
   * influencer findUniqueOrThrow
   */
  export type influencerFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the influencer
     */
    select?: influencerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the influencer
     */
    omit?: influencerOmit<ExtArgs> | null
    /**
     * Filter, which influencer to fetch.
     */
    where: influencerWhereUniqueInput
  }

  /**
   * influencer findFirst
   */
  export type influencerFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the influencer
     */
    select?: influencerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the influencer
     */
    omit?: influencerOmit<ExtArgs> | null
    /**
     * Filter, which influencer to fetch.
     */
    where?: influencerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of influencers to fetch.
     */
    orderBy?: influencerOrderByWithRelationInput | influencerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for influencers.
     */
    cursor?: influencerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` influencers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` influencers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of influencers.
     */
    distinct?: InfluencerScalarFieldEnum | InfluencerScalarFieldEnum[]
  }

  /**
   * influencer findFirstOrThrow
   */
  export type influencerFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the influencer
     */
    select?: influencerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the influencer
     */
    omit?: influencerOmit<ExtArgs> | null
    /**
     * Filter, which influencer to fetch.
     */
    where?: influencerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of influencers to fetch.
     */
    orderBy?: influencerOrderByWithRelationInput | influencerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for influencers.
     */
    cursor?: influencerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` influencers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` influencers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of influencers.
     */
    distinct?: InfluencerScalarFieldEnum | InfluencerScalarFieldEnum[]
  }

  /**
   * influencer findMany
   */
  export type influencerFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the influencer
     */
    select?: influencerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the influencer
     */
    omit?: influencerOmit<ExtArgs> | null
    /**
     * Filter, which influencers to fetch.
     */
    where?: influencerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of influencers to fetch.
     */
    orderBy?: influencerOrderByWithRelationInput | influencerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing influencers.
     */
    cursor?: influencerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` influencers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` influencers.
     */
    skip?: number
    distinct?: InfluencerScalarFieldEnum | InfluencerScalarFieldEnum[]
  }

  /**
   * influencer create
   */
  export type influencerCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the influencer
     */
    select?: influencerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the influencer
     */
    omit?: influencerOmit<ExtArgs> | null
    /**
     * The data needed to create a influencer.
     */
    data: XOR<influencerCreateInput, influencerUncheckedCreateInput>
  }

  /**
   * influencer createMany
   */
  export type influencerCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many influencers.
     */
    data: influencerCreateManyInput | influencerCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * influencer createManyAndReturn
   */
  export type influencerCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the influencer
     */
    select?: influencerSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the influencer
     */
    omit?: influencerOmit<ExtArgs> | null
    /**
     * The data used to create many influencers.
     */
    data: influencerCreateManyInput | influencerCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * influencer update
   */
  export type influencerUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the influencer
     */
    select?: influencerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the influencer
     */
    omit?: influencerOmit<ExtArgs> | null
    /**
     * The data needed to update a influencer.
     */
    data: XOR<influencerUpdateInput, influencerUncheckedUpdateInput>
    /**
     * Choose, which influencer to update.
     */
    where: influencerWhereUniqueInput
  }

  /**
   * influencer updateMany
   */
  export type influencerUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update influencers.
     */
    data: XOR<influencerUpdateManyMutationInput, influencerUncheckedUpdateManyInput>
    /**
     * Filter which influencers to update
     */
    where?: influencerWhereInput
    /**
     * Limit how many influencers to update.
     */
    limit?: number
  }

  /**
   * influencer updateManyAndReturn
   */
  export type influencerUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the influencer
     */
    select?: influencerSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the influencer
     */
    omit?: influencerOmit<ExtArgs> | null
    /**
     * The data used to update influencers.
     */
    data: XOR<influencerUpdateManyMutationInput, influencerUncheckedUpdateManyInput>
    /**
     * Filter which influencers to update
     */
    where?: influencerWhereInput
    /**
     * Limit how many influencers to update.
     */
    limit?: number
  }

  /**
   * influencer upsert
   */
  export type influencerUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the influencer
     */
    select?: influencerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the influencer
     */
    omit?: influencerOmit<ExtArgs> | null
    /**
     * The filter to search for the influencer to update in case it exists.
     */
    where: influencerWhereUniqueInput
    /**
     * In case the influencer found by the `where` argument doesn't exist, create a new influencer with this data.
     */
    create: XOR<influencerCreateInput, influencerUncheckedCreateInput>
    /**
     * In case the influencer was found with the provided `where` argument, update it with this data.
     */
    update: XOR<influencerUpdateInput, influencerUncheckedUpdateInput>
  }

  /**
   * influencer delete
   */
  export type influencerDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the influencer
     */
    select?: influencerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the influencer
     */
    omit?: influencerOmit<ExtArgs> | null
    /**
     * Filter which influencer to delete.
     */
    where: influencerWhereUniqueInput
  }

  /**
   * influencer deleteMany
   */
  export type influencerDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which influencers to delete
     */
    where?: influencerWhereInput
    /**
     * Limit how many influencers to delete.
     */
    limit?: number
  }

  /**
   * influencer without action
   */
  export type influencerDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the influencer
     */
    select?: influencerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the influencer
     */
    omit?: influencerOmit<ExtArgs> | null
  }


  /**
   * Model instagram_keyword_cache
   */

  export type AggregateInstagram_keyword_cache = {
    _count: Instagram_keyword_cacheCountAggregateOutputType | null
    _avg: Instagram_keyword_cacheAvgAggregateOutputType | null
    _sum: Instagram_keyword_cacheSumAggregateOutputType | null
    _min: Instagram_keyword_cacheMinAggregateOutputType | null
    _max: Instagram_keyword_cacheMaxAggregateOutputType | null
  }

  export type Instagram_keyword_cacheAvgAggregateOutputType = {
    id: number | null
  }

  export type Instagram_keyword_cacheSumAggregateOutputType = {
    id: bigint | null
  }

  export type Instagram_keyword_cacheMinAggregateOutputType = {
    id: bigint | null
    categories: string | null
    keywords: string | null
    prompt_version: string | null
    updated_at: Date | null
    username: string | null
  }

  export type Instagram_keyword_cacheMaxAggregateOutputType = {
    id: bigint | null
    categories: string | null
    keywords: string | null
    prompt_version: string | null
    updated_at: Date | null
    username: string | null
  }

  export type Instagram_keyword_cacheCountAggregateOutputType = {
    id: number
    categories: number
    keywords: number
    prompt_version: number
    updated_at: number
    username: number
    _all: number
  }


  export type Instagram_keyword_cacheAvgAggregateInputType = {
    id?: true
  }

  export type Instagram_keyword_cacheSumAggregateInputType = {
    id?: true
  }

  export type Instagram_keyword_cacheMinAggregateInputType = {
    id?: true
    categories?: true
    keywords?: true
    prompt_version?: true
    updated_at?: true
    username?: true
  }

  export type Instagram_keyword_cacheMaxAggregateInputType = {
    id?: true
    categories?: true
    keywords?: true
    prompt_version?: true
    updated_at?: true
    username?: true
  }

  export type Instagram_keyword_cacheCountAggregateInputType = {
    id?: true
    categories?: true
    keywords?: true
    prompt_version?: true
    updated_at?: true
    username?: true
    _all?: true
  }

  export type Instagram_keyword_cacheAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which instagram_keyword_cache to aggregate.
     */
    where?: instagram_keyword_cacheWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of instagram_keyword_caches to fetch.
     */
    orderBy?: instagram_keyword_cacheOrderByWithRelationInput | instagram_keyword_cacheOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: instagram_keyword_cacheWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` instagram_keyword_caches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` instagram_keyword_caches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned instagram_keyword_caches
    **/
    _count?: true | Instagram_keyword_cacheCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Instagram_keyword_cacheAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Instagram_keyword_cacheSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Instagram_keyword_cacheMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Instagram_keyword_cacheMaxAggregateInputType
  }

  export type GetInstagram_keyword_cacheAggregateType<T extends Instagram_keyword_cacheAggregateArgs> = {
        [P in keyof T & keyof AggregateInstagram_keyword_cache]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInstagram_keyword_cache[P]>
      : GetScalarType<T[P], AggregateInstagram_keyword_cache[P]>
  }




  export type instagram_keyword_cacheGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: instagram_keyword_cacheWhereInput
    orderBy?: instagram_keyword_cacheOrderByWithAggregationInput | instagram_keyword_cacheOrderByWithAggregationInput[]
    by: Instagram_keyword_cacheScalarFieldEnum[] | Instagram_keyword_cacheScalarFieldEnum
    having?: instagram_keyword_cacheScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Instagram_keyword_cacheCountAggregateInputType | true
    _avg?: Instagram_keyword_cacheAvgAggregateInputType
    _sum?: Instagram_keyword_cacheSumAggregateInputType
    _min?: Instagram_keyword_cacheMinAggregateInputType
    _max?: Instagram_keyword_cacheMaxAggregateInputType
  }

  export type Instagram_keyword_cacheGroupByOutputType = {
    id: bigint
    categories: string | null
    keywords: string | null
    prompt_version: string
    updated_at: Date | null
    username: string
    _count: Instagram_keyword_cacheCountAggregateOutputType | null
    _avg: Instagram_keyword_cacheAvgAggregateOutputType | null
    _sum: Instagram_keyword_cacheSumAggregateOutputType | null
    _min: Instagram_keyword_cacheMinAggregateOutputType | null
    _max: Instagram_keyword_cacheMaxAggregateOutputType | null
  }

  type GetInstagram_keyword_cacheGroupByPayload<T extends instagram_keyword_cacheGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Instagram_keyword_cacheGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Instagram_keyword_cacheGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Instagram_keyword_cacheGroupByOutputType[P]>
            : GetScalarType<T[P], Instagram_keyword_cacheGroupByOutputType[P]>
        }
      >
    >


  export type instagram_keyword_cacheSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    categories?: boolean
    keywords?: boolean
    prompt_version?: boolean
    updated_at?: boolean
    username?: boolean
  }, ExtArgs["result"]["instagram_keyword_cache"]>

  export type instagram_keyword_cacheSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    categories?: boolean
    keywords?: boolean
    prompt_version?: boolean
    updated_at?: boolean
    username?: boolean
  }, ExtArgs["result"]["instagram_keyword_cache"]>

  export type instagram_keyword_cacheSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    categories?: boolean
    keywords?: boolean
    prompt_version?: boolean
    updated_at?: boolean
    username?: boolean
  }, ExtArgs["result"]["instagram_keyword_cache"]>

  export type instagram_keyword_cacheSelectScalar = {
    id?: boolean
    categories?: boolean
    keywords?: boolean
    prompt_version?: boolean
    updated_at?: boolean
    username?: boolean
  }

  export type instagram_keyword_cacheOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "categories" | "keywords" | "prompt_version" | "updated_at" | "username", ExtArgs["result"]["instagram_keyword_cache"]>

  export type $instagram_keyword_cachePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "instagram_keyword_cache"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: bigint
      categories: string | null
      keywords: string | null
      prompt_version: string
      updated_at: Date | null
      username: string
    }, ExtArgs["result"]["instagram_keyword_cache"]>
    composites: {}
  }

  type instagram_keyword_cacheGetPayload<S extends boolean | null | undefined | instagram_keyword_cacheDefaultArgs> = $Result.GetResult<Prisma.$instagram_keyword_cachePayload, S>

  type instagram_keyword_cacheCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<instagram_keyword_cacheFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Instagram_keyword_cacheCountAggregateInputType | true
    }

  export interface instagram_keyword_cacheDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['instagram_keyword_cache'], meta: { name: 'instagram_keyword_cache' } }
    /**
     * Find zero or one Instagram_keyword_cache that matches the filter.
     * @param {instagram_keyword_cacheFindUniqueArgs} args - Arguments to find a Instagram_keyword_cache
     * @example
     * // Get one Instagram_keyword_cache
     * const instagram_keyword_cache = await prisma.instagram_keyword_cache.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends instagram_keyword_cacheFindUniqueArgs>(args: SelectSubset<T, instagram_keyword_cacheFindUniqueArgs<ExtArgs>>): Prisma__instagram_keyword_cacheClient<$Result.GetResult<Prisma.$instagram_keyword_cachePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Instagram_keyword_cache that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {instagram_keyword_cacheFindUniqueOrThrowArgs} args - Arguments to find a Instagram_keyword_cache
     * @example
     * // Get one Instagram_keyword_cache
     * const instagram_keyword_cache = await prisma.instagram_keyword_cache.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends instagram_keyword_cacheFindUniqueOrThrowArgs>(args: SelectSubset<T, instagram_keyword_cacheFindUniqueOrThrowArgs<ExtArgs>>): Prisma__instagram_keyword_cacheClient<$Result.GetResult<Prisma.$instagram_keyword_cachePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Instagram_keyword_cache that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {instagram_keyword_cacheFindFirstArgs} args - Arguments to find a Instagram_keyword_cache
     * @example
     * // Get one Instagram_keyword_cache
     * const instagram_keyword_cache = await prisma.instagram_keyword_cache.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends instagram_keyword_cacheFindFirstArgs>(args?: SelectSubset<T, instagram_keyword_cacheFindFirstArgs<ExtArgs>>): Prisma__instagram_keyword_cacheClient<$Result.GetResult<Prisma.$instagram_keyword_cachePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Instagram_keyword_cache that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {instagram_keyword_cacheFindFirstOrThrowArgs} args - Arguments to find a Instagram_keyword_cache
     * @example
     * // Get one Instagram_keyword_cache
     * const instagram_keyword_cache = await prisma.instagram_keyword_cache.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends instagram_keyword_cacheFindFirstOrThrowArgs>(args?: SelectSubset<T, instagram_keyword_cacheFindFirstOrThrowArgs<ExtArgs>>): Prisma__instagram_keyword_cacheClient<$Result.GetResult<Prisma.$instagram_keyword_cachePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Instagram_keyword_caches that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {instagram_keyword_cacheFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Instagram_keyword_caches
     * const instagram_keyword_caches = await prisma.instagram_keyword_cache.findMany()
     * 
     * // Get first 10 Instagram_keyword_caches
     * const instagram_keyword_caches = await prisma.instagram_keyword_cache.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const instagram_keyword_cacheWithIdOnly = await prisma.instagram_keyword_cache.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends instagram_keyword_cacheFindManyArgs>(args?: SelectSubset<T, instagram_keyword_cacheFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$instagram_keyword_cachePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Instagram_keyword_cache.
     * @param {instagram_keyword_cacheCreateArgs} args - Arguments to create a Instagram_keyword_cache.
     * @example
     * // Create one Instagram_keyword_cache
     * const Instagram_keyword_cache = await prisma.instagram_keyword_cache.create({
     *   data: {
     *     // ... data to create a Instagram_keyword_cache
     *   }
     * })
     * 
     */
    create<T extends instagram_keyword_cacheCreateArgs>(args: SelectSubset<T, instagram_keyword_cacheCreateArgs<ExtArgs>>): Prisma__instagram_keyword_cacheClient<$Result.GetResult<Prisma.$instagram_keyword_cachePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Instagram_keyword_caches.
     * @param {instagram_keyword_cacheCreateManyArgs} args - Arguments to create many Instagram_keyword_caches.
     * @example
     * // Create many Instagram_keyword_caches
     * const instagram_keyword_cache = await prisma.instagram_keyword_cache.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends instagram_keyword_cacheCreateManyArgs>(args?: SelectSubset<T, instagram_keyword_cacheCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Instagram_keyword_caches and returns the data saved in the database.
     * @param {instagram_keyword_cacheCreateManyAndReturnArgs} args - Arguments to create many Instagram_keyword_caches.
     * @example
     * // Create many Instagram_keyword_caches
     * const instagram_keyword_cache = await prisma.instagram_keyword_cache.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Instagram_keyword_caches and only return the `id`
     * const instagram_keyword_cacheWithIdOnly = await prisma.instagram_keyword_cache.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends instagram_keyword_cacheCreateManyAndReturnArgs>(args?: SelectSubset<T, instagram_keyword_cacheCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$instagram_keyword_cachePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Instagram_keyword_cache.
     * @param {instagram_keyword_cacheDeleteArgs} args - Arguments to delete one Instagram_keyword_cache.
     * @example
     * // Delete one Instagram_keyword_cache
     * const Instagram_keyword_cache = await prisma.instagram_keyword_cache.delete({
     *   where: {
     *     // ... filter to delete one Instagram_keyword_cache
     *   }
     * })
     * 
     */
    delete<T extends instagram_keyword_cacheDeleteArgs>(args: SelectSubset<T, instagram_keyword_cacheDeleteArgs<ExtArgs>>): Prisma__instagram_keyword_cacheClient<$Result.GetResult<Prisma.$instagram_keyword_cachePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Instagram_keyword_cache.
     * @param {instagram_keyword_cacheUpdateArgs} args - Arguments to update one Instagram_keyword_cache.
     * @example
     * // Update one Instagram_keyword_cache
     * const instagram_keyword_cache = await prisma.instagram_keyword_cache.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends instagram_keyword_cacheUpdateArgs>(args: SelectSubset<T, instagram_keyword_cacheUpdateArgs<ExtArgs>>): Prisma__instagram_keyword_cacheClient<$Result.GetResult<Prisma.$instagram_keyword_cachePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Instagram_keyword_caches.
     * @param {instagram_keyword_cacheDeleteManyArgs} args - Arguments to filter Instagram_keyword_caches to delete.
     * @example
     * // Delete a few Instagram_keyword_caches
     * const { count } = await prisma.instagram_keyword_cache.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends instagram_keyword_cacheDeleteManyArgs>(args?: SelectSubset<T, instagram_keyword_cacheDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Instagram_keyword_caches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {instagram_keyword_cacheUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Instagram_keyword_caches
     * const instagram_keyword_cache = await prisma.instagram_keyword_cache.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends instagram_keyword_cacheUpdateManyArgs>(args: SelectSubset<T, instagram_keyword_cacheUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Instagram_keyword_caches and returns the data updated in the database.
     * @param {instagram_keyword_cacheUpdateManyAndReturnArgs} args - Arguments to update many Instagram_keyword_caches.
     * @example
     * // Update many Instagram_keyword_caches
     * const instagram_keyword_cache = await prisma.instagram_keyword_cache.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Instagram_keyword_caches and only return the `id`
     * const instagram_keyword_cacheWithIdOnly = await prisma.instagram_keyword_cache.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends instagram_keyword_cacheUpdateManyAndReturnArgs>(args: SelectSubset<T, instagram_keyword_cacheUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$instagram_keyword_cachePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Instagram_keyword_cache.
     * @param {instagram_keyword_cacheUpsertArgs} args - Arguments to update or create a Instagram_keyword_cache.
     * @example
     * // Update or create a Instagram_keyword_cache
     * const instagram_keyword_cache = await prisma.instagram_keyword_cache.upsert({
     *   create: {
     *     // ... data to create a Instagram_keyword_cache
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Instagram_keyword_cache we want to update
     *   }
     * })
     */
    upsert<T extends instagram_keyword_cacheUpsertArgs>(args: SelectSubset<T, instagram_keyword_cacheUpsertArgs<ExtArgs>>): Prisma__instagram_keyword_cacheClient<$Result.GetResult<Prisma.$instagram_keyword_cachePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Instagram_keyword_caches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {instagram_keyword_cacheCountArgs} args - Arguments to filter Instagram_keyword_caches to count.
     * @example
     * // Count the number of Instagram_keyword_caches
     * const count = await prisma.instagram_keyword_cache.count({
     *   where: {
     *     // ... the filter for the Instagram_keyword_caches we want to count
     *   }
     * })
    **/
    count<T extends instagram_keyword_cacheCountArgs>(
      args?: Subset<T, instagram_keyword_cacheCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Instagram_keyword_cacheCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Instagram_keyword_cache.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Instagram_keyword_cacheAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Instagram_keyword_cacheAggregateArgs>(args: Subset<T, Instagram_keyword_cacheAggregateArgs>): Prisma.PrismaPromise<GetInstagram_keyword_cacheAggregateType<T>>

    /**
     * Group by Instagram_keyword_cache.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {instagram_keyword_cacheGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends instagram_keyword_cacheGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: instagram_keyword_cacheGroupByArgs['orderBy'] }
        : { orderBy?: instagram_keyword_cacheGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, instagram_keyword_cacheGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInstagram_keyword_cacheGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the instagram_keyword_cache model
   */
  readonly fields: instagram_keyword_cacheFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for instagram_keyword_cache.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__instagram_keyword_cacheClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the instagram_keyword_cache model
   */
  interface instagram_keyword_cacheFieldRefs {
    readonly id: FieldRef<"instagram_keyword_cache", 'BigInt'>
    readonly categories: FieldRef<"instagram_keyword_cache", 'String'>
    readonly keywords: FieldRef<"instagram_keyword_cache", 'String'>
    readonly prompt_version: FieldRef<"instagram_keyword_cache", 'String'>
    readonly updated_at: FieldRef<"instagram_keyword_cache", 'DateTime'>
    readonly username: FieldRef<"instagram_keyword_cache", 'String'>
  }
    

  // Custom InputTypes
  /**
   * instagram_keyword_cache findUnique
   */
  export type instagram_keyword_cacheFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the instagram_keyword_cache
     */
    select?: instagram_keyword_cacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the instagram_keyword_cache
     */
    omit?: instagram_keyword_cacheOmit<ExtArgs> | null
    /**
     * Filter, which instagram_keyword_cache to fetch.
     */
    where: instagram_keyword_cacheWhereUniqueInput
  }

  /**
   * instagram_keyword_cache findUniqueOrThrow
   */
  export type instagram_keyword_cacheFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the instagram_keyword_cache
     */
    select?: instagram_keyword_cacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the instagram_keyword_cache
     */
    omit?: instagram_keyword_cacheOmit<ExtArgs> | null
    /**
     * Filter, which instagram_keyword_cache to fetch.
     */
    where: instagram_keyword_cacheWhereUniqueInput
  }

  /**
   * instagram_keyword_cache findFirst
   */
  export type instagram_keyword_cacheFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the instagram_keyword_cache
     */
    select?: instagram_keyword_cacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the instagram_keyword_cache
     */
    omit?: instagram_keyword_cacheOmit<ExtArgs> | null
    /**
     * Filter, which instagram_keyword_cache to fetch.
     */
    where?: instagram_keyword_cacheWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of instagram_keyword_caches to fetch.
     */
    orderBy?: instagram_keyword_cacheOrderByWithRelationInput | instagram_keyword_cacheOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for instagram_keyword_caches.
     */
    cursor?: instagram_keyword_cacheWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` instagram_keyword_caches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` instagram_keyword_caches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of instagram_keyword_caches.
     */
    distinct?: Instagram_keyword_cacheScalarFieldEnum | Instagram_keyword_cacheScalarFieldEnum[]
  }

  /**
   * instagram_keyword_cache findFirstOrThrow
   */
  export type instagram_keyword_cacheFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the instagram_keyword_cache
     */
    select?: instagram_keyword_cacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the instagram_keyword_cache
     */
    omit?: instagram_keyword_cacheOmit<ExtArgs> | null
    /**
     * Filter, which instagram_keyword_cache to fetch.
     */
    where?: instagram_keyword_cacheWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of instagram_keyword_caches to fetch.
     */
    orderBy?: instagram_keyword_cacheOrderByWithRelationInput | instagram_keyword_cacheOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for instagram_keyword_caches.
     */
    cursor?: instagram_keyword_cacheWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` instagram_keyword_caches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` instagram_keyword_caches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of instagram_keyword_caches.
     */
    distinct?: Instagram_keyword_cacheScalarFieldEnum | Instagram_keyword_cacheScalarFieldEnum[]
  }

  /**
   * instagram_keyword_cache findMany
   */
  export type instagram_keyword_cacheFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the instagram_keyword_cache
     */
    select?: instagram_keyword_cacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the instagram_keyword_cache
     */
    omit?: instagram_keyword_cacheOmit<ExtArgs> | null
    /**
     * Filter, which instagram_keyword_caches to fetch.
     */
    where?: instagram_keyword_cacheWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of instagram_keyword_caches to fetch.
     */
    orderBy?: instagram_keyword_cacheOrderByWithRelationInput | instagram_keyword_cacheOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing instagram_keyword_caches.
     */
    cursor?: instagram_keyword_cacheWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` instagram_keyword_caches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` instagram_keyword_caches.
     */
    skip?: number
    distinct?: Instagram_keyword_cacheScalarFieldEnum | Instagram_keyword_cacheScalarFieldEnum[]
  }

  /**
   * instagram_keyword_cache create
   */
  export type instagram_keyword_cacheCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the instagram_keyword_cache
     */
    select?: instagram_keyword_cacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the instagram_keyword_cache
     */
    omit?: instagram_keyword_cacheOmit<ExtArgs> | null
    /**
     * The data needed to create a instagram_keyword_cache.
     */
    data: XOR<instagram_keyword_cacheCreateInput, instagram_keyword_cacheUncheckedCreateInput>
  }

  /**
   * instagram_keyword_cache createMany
   */
  export type instagram_keyword_cacheCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many instagram_keyword_caches.
     */
    data: instagram_keyword_cacheCreateManyInput | instagram_keyword_cacheCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * instagram_keyword_cache createManyAndReturn
   */
  export type instagram_keyword_cacheCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the instagram_keyword_cache
     */
    select?: instagram_keyword_cacheSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the instagram_keyword_cache
     */
    omit?: instagram_keyword_cacheOmit<ExtArgs> | null
    /**
     * The data used to create many instagram_keyword_caches.
     */
    data: instagram_keyword_cacheCreateManyInput | instagram_keyword_cacheCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * instagram_keyword_cache update
   */
  export type instagram_keyword_cacheUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the instagram_keyword_cache
     */
    select?: instagram_keyword_cacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the instagram_keyword_cache
     */
    omit?: instagram_keyword_cacheOmit<ExtArgs> | null
    /**
     * The data needed to update a instagram_keyword_cache.
     */
    data: XOR<instagram_keyword_cacheUpdateInput, instagram_keyword_cacheUncheckedUpdateInput>
    /**
     * Choose, which instagram_keyword_cache to update.
     */
    where: instagram_keyword_cacheWhereUniqueInput
  }

  /**
   * instagram_keyword_cache updateMany
   */
  export type instagram_keyword_cacheUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update instagram_keyword_caches.
     */
    data: XOR<instagram_keyword_cacheUpdateManyMutationInput, instagram_keyword_cacheUncheckedUpdateManyInput>
    /**
     * Filter which instagram_keyword_caches to update
     */
    where?: instagram_keyword_cacheWhereInput
    /**
     * Limit how many instagram_keyword_caches to update.
     */
    limit?: number
  }

  /**
   * instagram_keyword_cache updateManyAndReturn
   */
  export type instagram_keyword_cacheUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the instagram_keyword_cache
     */
    select?: instagram_keyword_cacheSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the instagram_keyword_cache
     */
    omit?: instagram_keyword_cacheOmit<ExtArgs> | null
    /**
     * The data used to update instagram_keyword_caches.
     */
    data: XOR<instagram_keyword_cacheUpdateManyMutationInput, instagram_keyword_cacheUncheckedUpdateManyInput>
    /**
     * Filter which instagram_keyword_caches to update
     */
    where?: instagram_keyword_cacheWhereInput
    /**
     * Limit how many instagram_keyword_caches to update.
     */
    limit?: number
  }

  /**
   * instagram_keyword_cache upsert
   */
  export type instagram_keyword_cacheUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the instagram_keyword_cache
     */
    select?: instagram_keyword_cacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the instagram_keyword_cache
     */
    omit?: instagram_keyword_cacheOmit<ExtArgs> | null
    /**
     * The filter to search for the instagram_keyword_cache to update in case it exists.
     */
    where: instagram_keyword_cacheWhereUniqueInput
    /**
     * In case the instagram_keyword_cache found by the `where` argument doesn't exist, create a new instagram_keyword_cache with this data.
     */
    create: XOR<instagram_keyword_cacheCreateInput, instagram_keyword_cacheUncheckedCreateInput>
    /**
     * In case the instagram_keyword_cache was found with the provided `where` argument, update it with this data.
     */
    update: XOR<instagram_keyword_cacheUpdateInput, instagram_keyword_cacheUncheckedUpdateInput>
  }

  /**
   * instagram_keyword_cache delete
   */
  export type instagram_keyword_cacheDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the instagram_keyword_cache
     */
    select?: instagram_keyword_cacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the instagram_keyword_cache
     */
    omit?: instagram_keyword_cacheOmit<ExtArgs> | null
    /**
     * Filter which instagram_keyword_cache to delete.
     */
    where: instagram_keyword_cacheWhereUniqueInput
  }

  /**
   * instagram_keyword_cache deleteMany
   */
  export type instagram_keyword_cacheDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which instagram_keyword_caches to delete
     */
    where?: instagram_keyword_cacheWhereInput
    /**
     * Limit how many instagram_keyword_caches to delete.
     */
    limit?: number
  }

  /**
   * instagram_keyword_cache without action
   */
  export type instagram_keyword_cacheDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the instagram_keyword_cache
     */
    select?: instagram_keyword_cacheSelect<ExtArgs> | null
    /**
     * Omit specific fields from the instagram_keyword_cache
     */
    omit?: instagram_keyword_cacheOmit<ExtArgs> | null
  }


  /**
   * Model instagram_posts
   */

  export type AggregateInstagram_posts = {
    _count: Instagram_postsCountAggregateOutputType | null
    _avg: Instagram_postsAvgAggregateOutputType | null
    _sum: Instagram_postsSumAggregateOutputType | null
    _min: Instagram_postsMinAggregateOutputType | null
    _max: Instagram_postsMaxAggregateOutputType | null
  }

  export type Instagram_postsAvgAggregateOutputType = {
    comment_count: number | null
    like_count: number | null
    video_view_count: number | null
  }

  export type Instagram_postsSumAggregateOutputType = {
    comment_count: number | null
    like_count: number | null
    video_view_count: number | null
  }

  export type Instagram_postsMinAggregateOutputType = {
    post_id: string | null
    caption: string | null
    comment_count: number | null
    display_url: string | null
    is_video: boolean | null
    like_count: number | null
    media_type: string | null
    permalink: string | null
    shortcode: string | null
    taken_at: string | null
    thumbnail_url: string | null
    updated_at: Date | null
    username: string | null
    video_view_count: number | null
  }

  export type Instagram_postsMaxAggregateOutputType = {
    post_id: string | null
    caption: string | null
    comment_count: number | null
    display_url: string | null
    is_video: boolean | null
    like_count: number | null
    media_type: string | null
    permalink: string | null
    shortcode: string | null
    taken_at: string | null
    thumbnail_url: string | null
    updated_at: Date | null
    username: string | null
    video_view_count: number | null
  }

  export type Instagram_postsCountAggregateOutputType = {
    post_id: number
    caption: number
    comment_count: number
    display_url: number
    is_video: number
    like_count: number
    media_type: number
    permalink: number
    shortcode: number
    taken_at: number
    thumbnail_url: number
    updated_at: number
    username: number
    video_view_count: number
    _all: number
  }


  export type Instagram_postsAvgAggregateInputType = {
    comment_count?: true
    like_count?: true
    video_view_count?: true
  }

  export type Instagram_postsSumAggregateInputType = {
    comment_count?: true
    like_count?: true
    video_view_count?: true
  }

  export type Instagram_postsMinAggregateInputType = {
    post_id?: true
    caption?: true
    comment_count?: true
    display_url?: true
    is_video?: true
    like_count?: true
    media_type?: true
    permalink?: true
    shortcode?: true
    taken_at?: true
    thumbnail_url?: true
    updated_at?: true
    username?: true
    video_view_count?: true
  }

  export type Instagram_postsMaxAggregateInputType = {
    post_id?: true
    caption?: true
    comment_count?: true
    display_url?: true
    is_video?: true
    like_count?: true
    media_type?: true
    permalink?: true
    shortcode?: true
    taken_at?: true
    thumbnail_url?: true
    updated_at?: true
    username?: true
    video_view_count?: true
  }

  export type Instagram_postsCountAggregateInputType = {
    post_id?: true
    caption?: true
    comment_count?: true
    display_url?: true
    is_video?: true
    like_count?: true
    media_type?: true
    permalink?: true
    shortcode?: true
    taken_at?: true
    thumbnail_url?: true
    updated_at?: true
    username?: true
    video_view_count?: true
    _all?: true
  }

  export type Instagram_postsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which instagram_posts to aggregate.
     */
    where?: instagram_postsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of instagram_posts to fetch.
     */
    orderBy?: instagram_postsOrderByWithRelationInput | instagram_postsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: instagram_postsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` instagram_posts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` instagram_posts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned instagram_posts
    **/
    _count?: true | Instagram_postsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Instagram_postsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Instagram_postsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Instagram_postsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Instagram_postsMaxAggregateInputType
  }

  export type GetInstagram_postsAggregateType<T extends Instagram_postsAggregateArgs> = {
        [P in keyof T & keyof AggregateInstagram_posts]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInstagram_posts[P]>
      : GetScalarType<T[P], AggregateInstagram_posts[P]>
  }




  export type instagram_postsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: instagram_postsWhereInput
    orderBy?: instagram_postsOrderByWithAggregationInput | instagram_postsOrderByWithAggregationInput[]
    by: Instagram_postsScalarFieldEnum[] | Instagram_postsScalarFieldEnum
    having?: instagram_postsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Instagram_postsCountAggregateInputType | true
    _avg?: Instagram_postsAvgAggregateInputType
    _sum?: Instagram_postsSumAggregateInputType
    _min?: Instagram_postsMinAggregateInputType
    _max?: Instagram_postsMaxAggregateInputType
  }

  export type Instagram_postsGroupByOutputType = {
    post_id: string
    caption: string | null
    comment_count: number | null
    display_url: string | null
    is_video: boolean | null
    like_count: number | null
    media_type: string | null
    permalink: string | null
    shortcode: string | null
    taken_at: string | null
    thumbnail_url: string | null
    updated_at: Date | null
    username: string
    video_view_count: number | null
    _count: Instagram_postsCountAggregateOutputType | null
    _avg: Instagram_postsAvgAggregateOutputType | null
    _sum: Instagram_postsSumAggregateOutputType | null
    _min: Instagram_postsMinAggregateOutputType | null
    _max: Instagram_postsMaxAggregateOutputType | null
  }

  type GetInstagram_postsGroupByPayload<T extends instagram_postsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Instagram_postsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Instagram_postsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Instagram_postsGroupByOutputType[P]>
            : GetScalarType<T[P], Instagram_postsGroupByOutputType[P]>
        }
      >
    >


  export type instagram_postsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    post_id?: boolean
    caption?: boolean
    comment_count?: boolean
    display_url?: boolean
    is_video?: boolean
    like_count?: boolean
    media_type?: boolean
    permalink?: boolean
    shortcode?: boolean
    taken_at?: boolean
    thumbnail_url?: boolean
    updated_at?: boolean
    username?: boolean
    video_view_count?: boolean
  }, ExtArgs["result"]["instagram_posts"]>

  export type instagram_postsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    post_id?: boolean
    caption?: boolean
    comment_count?: boolean
    display_url?: boolean
    is_video?: boolean
    like_count?: boolean
    media_type?: boolean
    permalink?: boolean
    shortcode?: boolean
    taken_at?: boolean
    thumbnail_url?: boolean
    updated_at?: boolean
    username?: boolean
    video_view_count?: boolean
  }, ExtArgs["result"]["instagram_posts"]>

  export type instagram_postsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    post_id?: boolean
    caption?: boolean
    comment_count?: boolean
    display_url?: boolean
    is_video?: boolean
    like_count?: boolean
    media_type?: boolean
    permalink?: boolean
    shortcode?: boolean
    taken_at?: boolean
    thumbnail_url?: boolean
    updated_at?: boolean
    username?: boolean
    video_view_count?: boolean
  }, ExtArgs["result"]["instagram_posts"]>

  export type instagram_postsSelectScalar = {
    post_id?: boolean
    caption?: boolean
    comment_count?: boolean
    display_url?: boolean
    is_video?: boolean
    like_count?: boolean
    media_type?: boolean
    permalink?: boolean
    shortcode?: boolean
    taken_at?: boolean
    thumbnail_url?: boolean
    updated_at?: boolean
    username?: boolean
    video_view_count?: boolean
  }

  export type instagram_postsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"post_id" | "caption" | "comment_count" | "display_url" | "is_video" | "like_count" | "media_type" | "permalink" | "shortcode" | "taken_at" | "thumbnail_url" | "updated_at" | "username" | "video_view_count", ExtArgs["result"]["instagram_posts"]>

  export type $instagram_postsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "instagram_posts"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      post_id: string
      caption: string | null
      comment_count: number | null
      display_url: string | null
      is_video: boolean | null
      like_count: number | null
      media_type: string | null
      permalink: string | null
      shortcode: string | null
      taken_at: string | null
      thumbnail_url: string | null
      updated_at: Date | null
      username: string
      video_view_count: number | null
    }, ExtArgs["result"]["instagram_posts"]>
    composites: {}
  }

  type instagram_postsGetPayload<S extends boolean | null | undefined | instagram_postsDefaultArgs> = $Result.GetResult<Prisma.$instagram_postsPayload, S>

  type instagram_postsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<instagram_postsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Instagram_postsCountAggregateInputType | true
    }

  export interface instagram_postsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['instagram_posts'], meta: { name: 'instagram_posts' } }
    /**
     * Find zero or one Instagram_posts that matches the filter.
     * @param {instagram_postsFindUniqueArgs} args - Arguments to find a Instagram_posts
     * @example
     * // Get one Instagram_posts
     * const instagram_posts = await prisma.instagram_posts.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends instagram_postsFindUniqueArgs>(args: SelectSubset<T, instagram_postsFindUniqueArgs<ExtArgs>>): Prisma__instagram_postsClient<$Result.GetResult<Prisma.$instagram_postsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Instagram_posts that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {instagram_postsFindUniqueOrThrowArgs} args - Arguments to find a Instagram_posts
     * @example
     * // Get one Instagram_posts
     * const instagram_posts = await prisma.instagram_posts.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends instagram_postsFindUniqueOrThrowArgs>(args: SelectSubset<T, instagram_postsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__instagram_postsClient<$Result.GetResult<Prisma.$instagram_postsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Instagram_posts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {instagram_postsFindFirstArgs} args - Arguments to find a Instagram_posts
     * @example
     * // Get one Instagram_posts
     * const instagram_posts = await prisma.instagram_posts.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends instagram_postsFindFirstArgs>(args?: SelectSubset<T, instagram_postsFindFirstArgs<ExtArgs>>): Prisma__instagram_postsClient<$Result.GetResult<Prisma.$instagram_postsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Instagram_posts that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {instagram_postsFindFirstOrThrowArgs} args - Arguments to find a Instagram_posts
     * @example
     * // Get one Instagram_posts
     * const instagram_posts = await prisma.instagram_posts.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends instagram_postsFindFirstOrThrowArgs>(args?: SelectSubset<T, instagram_postsFindFirstOrThrowArgs<ExtArgs>>): Prisma__instagram_postsClient<$Result.GetResult<Prisma.$instagram_postsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Instagram_posts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {instagram_postsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Instagram_posts
     * const instagram_posts = await prisma.instagram_posts.findMany()
     * 
     * // Get first 10 Instagram_posts
     * const instagram_posts = await prisma.instagram_posts.findMany({ take: 10 })
     * 
     * // Only select the `post_id`
     * const instagram_postsWithPost_idOnly = await prisma.instagram_posts.findMany({ select: { post_id: true } })
     * 
     */
    findMany<T extends instagram_postsFindManyArgs>(args?: SelectSubset<T, instagram_postsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$instagram_postsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Instagram_posts.
     * @param {instagram_postsCreateArgs} args - Arguments to create a Instagram_posts.
     * @example
     * // Create one Instagram_posts
     * const Instagram_posts = await prisma.instagram_posts.create({
     *   data: {
     *     // ... data to create a Instagram_posts
     *   }
     * })
     * 
     */
    create<T extends instagram_postsCreateArgs>(args: SelectSubset<T, instagram_postsCreateArgs<ExtArgs>>): Prisma__instagram_postsClient<$Result.GetResult<Prisma.$instagram_postsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Instagram_posts.
     * @param {instagram_postsCreateManyArgs} args - Arguments to create many Instagram_posts.
     * @example
     * // Create many Instagram_posts
     * const instagram_posts = await prisma.instagram_posts.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends instagram_postsCreateManyArgs>(args?: SelectSubset<T, instagram_postsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Instagram_posts and returns the data saved in the database.
     * @param {instagram_postsCreateManyAndReturnArgs} args - Arguments to create many Instagram_posts.
     * @example
     * // Create many Instagram_posts
     * const instagram_posts = await prisma.instagram_posts.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Instagram_posts and only return the `post_id`
     * const instagram_postsWithPost_idOnly = await prisma.instagram_posts.createManyAndReturn({
     *   select: { post_id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends instagram_postsCreateManyAndReturnArgs>(args?: SelectSubset<T, instagram_postsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$instagram_postsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Instagram_posts.
     * @param {instagram_postsDeleteArgs} args - Arguments to delete one Instagram_posts.
     * @example
     * // Delete one Instagram_posts
     * const Instagram_posts = await prisma.instagram_posts.delete({
     *   where: {
     *     // ... filter to delete one Instagram_posts
     *   }
     * })
     * 
     */
    delete<T extends instagram_postsDeleteArgs>(args: SelectSubset<T, instagram_postsDeleteArgs<ExtArgs>>): Prisma__instagram_postsClient<$Result.GetResult<Prisma.$instagram_postsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Instagram_posts.
     * @param {instagram_postsUpdateArgs} args - Arguments to update one Instagram_posts.
     * @example
     * // Update one Instagram_posts
     * const instagram_posts = await prisma.instagram_posts.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends instagram_postsUpdateArgs>(args: SelectSubset<T, instagram_postsUpdateArgs<ExtArgs>>): Prisma__instagram_postsClient<$Result.GetResult<Prisma.$instagram_postsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Instagram_posts.
     * @param {instagram_postsDeleteManyArgs} args - Arguments to filter Instagram_posts to delete.
     * @example
     * // Delete a few Instagram_posts
     * const { count } = await prisma.instagram_posts.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends instagram_postsDeleteManyArgs>(args?: SelectSubset<T, instagram_postsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Instagram_posts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {instagram_postsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Instagram_posts
     * const instagram_posts = await prisma.instagram_posts.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends instagram_postsUpdateManyArgs>(args: SelectSubset<T, instagram_postsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Instagram_posts and returns the data updated in the database.
     * @param {instagram_postsUpdateManyAndReturnArgs} args - Arguments to update many Instagram_posts.
     * @example
     * // Update many Instagram_posts
     * const instagram_posts = await prisma.instagram_posts.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Instagram_posts and only return the `post_id`
     * const instagram_postsWithPost_idOnly = await prisma.instagram_posts.updateManyAndReturn({
     *   select: { post_id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends instagram_postsUpdateManyAndReturnArgs>(args: SelectSubset<T, instagram_postsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$instagram_postsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Instagram_posts.
     * @param {instagram_postsUpsertArgs} args - Arguments to update or create a Instagram_posts.
     * @example
     * // Update or create a Instagram_posts
     * const instagram_posts = await prisma.instagram_posts.upsert({
     *   create: {
     *     // ... data to create a Instagram_posts
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Instagram_posts we want to update
     *   }
     * })
     */
    upsert<T extends instagram_postsUpsertArgs>(args: SelectSubset<T, instagram_postsUpsertArgs<ExtArgs>>): Prisma__instagram_postsClient<$Result.GetResult<Prisma.$instagram_postsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Instagram_posts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {instagram_postsCountArgs} args - Arguments to filter Instagram_posts to count.
     * @example
     * // Count the number of Instagram_posts
     * const count = await prisma.instagram_posts.count({
     *   where: {
     *     // ... the filter for the Instagram_posts we want to count
     *   }
     * })
    **/
    count<T extends instagram_postsCountArgs>(
      args?: Subset<T, instagram_postsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Instagram_postsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Instagram_posts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Instagram_postsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Instagram_postsAggregateArgs>(args: Subset<T, Instagram_postsAggregateArgs>): Prisma.PrismaPromise<GetInstagram_postsAggregateType<T>>

    /**
     * Group by Instagram_posts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {instagram_postsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends instagram_postsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: instagram_postsGroupByArgs['orderBy'] }
        : { orderBy?: instagram_postsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, instagram_postsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInstagram_postsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the instagram_posts model
   */
  readonly fields: instagram_postsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for instagram_posts.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__instagram_postsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the instagram_posts model
   */
  interface instagram_postsFieldRefs {
    readonly post_id: FieldRef<"instagram_posts", 'String'>
    readonly caption: FieldRef<"instagram_posts", 'String'>
    readonly comment_count: FieldRef<"instagram_posts", 'Int'>
    readonly display_url: FieldRef<"instagram_posts", 'String'>
    readonly is_video: FieldRef<"instagram_posts", 'Boolean'>
    readonly like_count: FieldRef<"instagram_posts", 'Int'>
    readonly media_type: FieldRef<"instagram_posts", 'String'>
    readonly permalink: FieldRef<"instagram_posts", 'String'>
    readonly shortcode: FieldRef<"instagram_posts", 'String'>
    readonly taken_at: FieldRef<"instagram_posts", 'String'>
    readonly thumbnail_url: FieldRef<"instagram_posts", 'String'>
    readonly updated_at: FieldRef<"instagram_posts", 'DateTime'>
    readonly username: FieldRef<"instagram_posts", 'String'>
    readonly video_view_count: FieldRef<"instagram_posts", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * instagram_posts findUnique
   */
  export type instagram_postsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the instagram_posts
     */
    select?: instagram_postsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the instagram_posts
     */
    omit?: instagram_postsOmit<ExtArgs> | null
    /**
     * Filter, which instagram_posts to fetch.
     */
    where: instagram_postsWhereUniqueInput
  }

  /**
   * instagram_posts findUniqueOrThrow
   */
  export type instagram_postsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the instagram_posts
     */
    select?: instagram_postsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the instagram_posts
     */
    omit?: instagram_postsOmit<ExtArgs> | null
    /**
     * Filter, which instagram_posts to fetch.
     */
    where: instagram_postsWhereUniqueInput
  }

  /**
   * instagram_posts findFirst
   */
  export type instagram_postsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the instagram_posts
     */
    select?: instagram_postsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the instagram_posts
     */
    omit?: instagram_postsOmit<ExtArgs> | null
    /**
     * Filter, which instagram_posts to fetch.
     */
    where?: instagram_postsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of instagram_posts to fetch.
     */
    orderBy?: instagram_postsOrderByWithRelationInput | instagram_postsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for instagram_posts.
     */
    cursor?: instagram_postsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` instagram_posts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` instagram_posts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of instagram_posts.
     */
    distinct?: Instagram_postsScalarFieldEnum | Instagram_postsScalarFieldEnum[]
  }

  /**
   * instagram_posts findFirstOrThrow
   */
  export type instagram_postsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the instagram_posts
     */
    select?: instagram_postsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the instagram_posts
     */
    omit?: instagram_postsOmit<ExtArgs> | null
    /**
     * Filter, which instagram_posts to fetch.
     */
    where?: instagram_postsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of instagram_posts to fetch.
     */
    orderBy?: instagram_postsOrderByWithRelationInput | instagram_postsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for instagram_posts.
     */
    cursor?: instagram_postsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` instagram_posts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` instagram_posts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of instagram_posts.
     */
    distinct?: Instagram_postsScalarFieldEnum | Instagram_postsScalarFieldEnum[]
  }

  /**
   * instagram_posts findMany
   */
  export type instagram_postsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the instagram_posts
     */
    select?: instagram_postsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the instagram_posts
     */
    omit?: instagram_postsOmit<ExtArgs> | null
    /**
     * Filter, which instagram_posts to fetch.
     */
    where?: instagram_postsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of instagram_posts to fetch.
     */
    orderBy?: instagram_postsOrderByWithRelationInput | instagram_postsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing instagram_posts.
     */
    cursor?: instagram_postsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` instagram_posts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` instagram_posts.
     */
    skip?: number
    distinct?: Instagram_postsScalarFieldEnum | Instagram_postsScalarFieldEnum[]
  }

  /**
   * instagram_posts create
   */
  export type instagram_postsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the instagram_posts
     */
    select?: instagram_postsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the instagram_posts
     */
    omit?: instagram_postsOmit<ExtArgs> | null
    /**
     * The data needed to create a instagram_posts.
     */
    data: XOR<instagram_postsCreateInput, instagram_postsUncheckedCreateInput>
  }

  /**
   * instagram_posts createMany
   */
  export type instagram_postsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many instagram_posts.
     */
    data: instagram_postsCreateManyInput | instagram_postsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * instagram_posts createManyAndReturn
   */
  export type instagram_postsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the instagram_posts
     */
    select?: instagram_postsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the instagram_posts
     */
    omit?: instagram_postsOmit<ExtArgs> | null
    /**
     * The data used to create many instagram_posts.
     */
    data: instagram_postsCreateManyInput | instagram_postsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * instagram_posts update
   */
  export type instagram_postsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the instagram_posts
     */
    select?: instagram_postsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the instagram_posts
     */
    omit?: instagram_postsOmit<ExtArgs> | null
    /**
     * The data needed to update a instagram_posts.
     */
    data: XOR<instagram_postsUpdateInput, instagram_postsUncheckedUpdateInput>
    /**
     * Choose, which instagram_posts to update.
     */
    where: instagram_postsWhereUniqueInput
  }

  /**
   * instagram_posts updateMany
   */
  export type instagram_postsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update instagram_posts.
     */
    data: XOR<instagram_postsUpdateManyMutationInput, instagram_postsUncheckedUpdateManyInput>
    /**
     * Filter which instagram_posts to update
     */
    where?: instagram_postsWhereInput
    /**
     * Limit how many instagram_posts to update.
     */
    limit?: number
  }

  /**
   * instagram_posts updateManyAndReturn
   */
  export type instagram_postsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the instagram_posts
     */
    select?: instagram_postsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the instagram_posts
     */
    omit?: instagram_postsOmit<ExtArgs> | null
    /**
     * The data used to update instagram_posts.
     */
    data: XOR<instagram_postsUpdateManyMutationInput, instagram_postsUncheckedUpdateManyInput>
    /**
     * Filter which instagram_posts to update
     */
    where?: instagram_postsWhereInput
    /**
     * Limit how many instagram_posts to update.
     */
    limit?: number
  }

  /**
   * instagram_posts upsert
   */
  export type instagram_postsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the instagram_posts
     */
    select?: instagram_postsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the instagram_posts
     */
    omit?: instagram_postsOmit<ExtArgs> | null
    /**
     * The filter to search for the instagram_posts to update in case it exists.
     */
    where: instagram_postsWhereUniqueInput
    /**
     * In case the instagram_posts found by the `where` argument doesn't exist, create a new instagram_posts with this data.
     */
    create: XOR<instagram_postsCreateInput, instagram_postsUncheckedCreateInput>
    /**
     * In case the instagram_posts was found with the provided `where` argument, update it with this data.
     */
    update: XOR<instagram_postsUpdateInput, instagram_postsUncheckedUpdateInput>
  }

  /**
   * instagram_posts delete
   */
  export type instagram_postsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the instagram_posts
     */
    select?: instagram_postsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the instagram_posts
     */
    omit?: instagram_postsOmit<ExtArgs> | null
    /**
     * Filter which instagram_posts to delete.
     */
    where: instagram_postsWhereUniqueInput
  }

  /**
   * instagram_posts deleteMany
   */
  export type instagram_postsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which instagram_posts to delete
     */
    where?: instagram_postsWhereInput
    /**
     * Limit how many instagram_posts to delete.
     */
    limit?: number
  }

  /**
   * instagram_posts without action
   */
  export type instagram_postsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the instagram_posts
     */
    select?: instagram_postsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the instagram_posts
     */
    omit?: instagram_postsOmit<ExtArgs> | null
  }


  /**
   * Model instagram_profiles
   */

  export type AggregateInstagram_profiles = {
    _count: Instagram_profilesCountAggregateOutputType | null
    _avg: Instagram_profilesAvgAggregateOutputType | null
    _sum: Instagram_profilesSumAggregateOutputType | null
    _min: Instagram_profilesMinAggregateOutputType | null
    _max: Instagram_profilesMaxAggregateOutputType | null
  }

  export type Instagram_profilesAvgAggregateOutputType = {
    followers: number | null
    following: number | null
    media_count: number | null
  }

  export type Instagram_profilesSumAggregateOutputType = {
    followers: number | null
    following: number | null
    media_count: number | null
  }

  export type Instagram_profilesMinAggregateOutputType = {
    username: string | null
    biography: string | null
    category_name: string | null
    external_url: string | null
    followers: number | null
    following: number | null
    full_name: string | null
    is_private: boolean | null
    is_verified: boolean | null
    media_count: number | null
    profile_pic_url: string | null
    updated_at: Date | null
  }

  export type Instagram_profilesMaxAggregateOutputType = {
    username: string | null
    biography: string | null
    category_name: string | null
    external_url: string | null
    followers: number | null
    following: number | null
    full_name: string | null
    is_private: boolean | null
    is_verified: boolean | null
    media_count: number | null
    profile_pic_url: string | null
    updated_at: Date | null
  }

  export type Instagram_profilesCountAggregateOutputType = {
    username: number
    biography: number
    category_name: number
    external_url: number
    followers: number
    following: number
    full_name: number
    is_private: number
    is_verified: number
    media_count: number
    profile_pic_url: number
    updated_at: number
    _all: number
  }


  export type Instagram_profilesAvgAggregateInputType = {
    followers?: true
    following?: true
    media_count?: true
  }

  export type Instagram_profilesSumAggregateInputType = {
    followers?: true
    following?: true
    media_count?: true
  }

  export type Instagram_profilesMinAggregateInputType = {
    username?: true
    biography?: true
    category_name?: true
    external_url?: true
    followers?: true
    following?: true
    full_name?: true
    is_private?: true
    is_verified?: true
    media_count?: true
    profile_pic_url?: true
    updated_at?: true
  }

  export type Instagram_profilesMaxAggregateInputType = {
    username?: true
    biography?: true
    category_name?: true
    external_url?: true
    followers?: true
    following?: true
    full_name?: true
    is_private?: true
    is_verified?: true
    media_count?: true
    profile_pic_url?: true
    updated_at?: true
  }

  export type Instagram_profilesCountAggregateInputType = {
    username?: true
    biography?: true
    category_name?: true
    external_url?: true
    followers?: true
    following?: true
    full_name?: true
    is_private?: true
    is_verified?: true
    media_count?: true
    profile_pic_url?: true
    updated_at?: true
    _all?: true
  }

  export type Instagram_profilesAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which instagram_profiles to aggregate.
     */
    where?: instagram_profilesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of instagram_profiles to fetch.
     */
    orderBy?: instagram_profilesOrderByWithRelationInput | instagram_profilesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: instagram_profilesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` instagram_profiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` instagram_profiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned instagram_profiles
    **/
    _count?: true | Instagram_profilesCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Instagram_profilesAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Instagram_profilesSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Instagram_profilesMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Instagram_profilesMaxAggregateInputType
  }

  export type GetInstagram_profilesAggregateType<T extends Instagram_profilesAggregateArgs> = {
        [P in keyof T & keyof AggregateInstagram_profiles]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInstagram_profiles[P]>
      : GetScalarType<T[P], AggregateInstagram_profiles[P]>
  }




  export type instagram_profilesGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: instagram_profilesWhereInput
    orderBy?: instagram_profilesOrderByWithAggregationInput | instagram_profilesOrderByWithAggregationInput[]
    by: Instagram_profilesScalarFieldEnum[] | Instagram_profilesScalarFieldEnum
    having?: instagram_profilesScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Instagram_profilesCountAggregateInputType | true
    _avg?: Instagram_profilesAvgAggregateInputType
    _sum?: Instagram_profilesSumAggregateInputType
    _min?: Instagram_profilesMinAggregateInputType
    _max?: Instagram_profilesMaxAggregateInputType
  }

  export type Instagram_profilesGroupByOutputType = {
    username: string
    biography: string | null
    category_name: string | null
    external_url: string | null
    followers: number | null
    following: number | null
    full_name: string | null
    is_private: boolean | null
    is_verified: boolean | null
    media_count: number | null
    profile_pic_url: string | null
    updated_at: Date | null
    _count: Instagram_profilesCountAggregateOutputType | null
    _avg: Instagram_profilesAvgAggregateOutputType | null
    _sum: Instagram_profilesSumAggregateOutputType | null
    _min: Instagram_profilesMinAggregateOutputType | null
    _max: Instagram_profilesMaxAggregateOutputType | null
  }

  type GetInstagram_profilesGroupByPayload<T extends instagram_profilesGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Instagram_profilesGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Instagram_profilesGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Instagram_profilesGroupByOutputType[P]>
            : GetScalarType<T[P], Instagram_profilesGroupByOutputType[P]>
        }
      >
    >


  export type instagram_profilesSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    username?: boolean
    biography?: boolean
    category_name?: boolean
    external_url?: boolean
    followers?: boolean
    following?: boolean
    full_name?: boolean
    is_private?: boolean
    is_verified?: boolean
    media_count?: boolean
    profile_pic_url?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["instagram_profiles"]>

  export type instagram_profilesSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    username?: boolean
    biography?: boolean
    category_name?: boolean
    external_url?: boolean
    followers?: boolean
    following?: boolean
    full_name?: boolean
    is_private?: boolean
    is_verified?: boolean
    media_count?: boolean
    profile_pic_url?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["instagram_profiles"]>

  export type instagram_profilesSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    username?: boolean
    biography?: boolean
    category_name?: boolean
    external_url?: boolean
    followers?: boolean
    following?: boolean
    full_name?: boolean
    is_private?: boolean
    is_verified?: boolean
    media_count?: boolean
    profile_pic_url?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["instagram_profiles"]>

  export type instagram_profilesSelectScalar = {
    username?: boolean
    biography?: boolean
    category_name?: boolean
    external_url?: boolean
    followers?: boolean
    following?: boolean
    full_name?: boolean
    is_private?: boolean
    is_verified?: boolean
    media_count?: boolean
    profile_pic_url?: boolean
    updated_at?: boolean
  }

  export type instagram_profilesOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"username" | "biography" | "category_name" | "external_url" | "followers" | "following" | "full_name" | "is_private" | "is_verified" | "media_count" | "profile_pic_url" | "updated_at", ExtArgs["result"]["instagram_profiles"]>

  export type $instagram_profilesPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "instagram_profiles"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      username: string
      biography: string | null
      category_name: string | null
      external_url: string | null
      followers: number | null
      following: number | null
      full_name: string | null
      is_private: boolean | null
      is_verified: boolean | null
      media_count: number | null
      profile_pic_url: string | null
      updated_at: Date | null
    }, ExtArgs["result"]["instagram_profiles"]>
    composites: {}
  }

  type instagram_profilesGetPayload<S extends boolean | null | undefined | instagram_profilesDefaultArgs> = $Result.GetResult<Prisma.$instagram_profilesPayload, S>

  type instagram_profilesCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<instagram_profilesFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Instagram_profilesCountAggregateInputType | true
    }

  export interface instagram_profilesDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['instagram_profiles'], meta: { name: 'instagram_profiles' } }
    /**
     * Find zero or one Instagram_profiles that matches the filter.
     * @param {instagram_profilesFindUniqueArgs} args - Arguments to find a Instagram_profiles
     * @example
     * // Get one Instagram_profiles
     * const instagram_profiles = await prisma.instagram_profiles.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends instagram_profilesFindUniqueArgs>(args: SelectSubset<T, instagram_profilesFindUniqueArgs<ExtArgs>>): Prisma__instagram_profilesClient<$Result.GetResult<Prisma.$instagram_profilesPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Instagram_profiles that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {instagram_profilesFindUniqueOrThrowArgs} args - Arguments to find a Instagram_profiles
     * @example
     * // Get one Instagram_profiles
     * const instagram_profiles = await prisma.instagram_profiles.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends instagram_profilesFindUniqueOrThrowArgs>(args: SelectSubset<T, instagram_profilesFindUniqueOrThrowArgs<ExtArgs>>): Prisma__instagram_profilesClient<$Result.GetResult<Prisma.$instagram_profilesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Instagram_profiles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {instagram_profilesFindFirstArgs} args - Arguments to find a Instagram_profiles
     * @example
     * // Get one Instagram_profiles
     * const instagram_profiles = await prisma.instagram_profiles.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends instagram_profilesFindFirstArgs>(args?: SelectSubset<T, instagram_profilesFindFirstArgs<ExtArgs>>): Prisma__instagram_profilesClient<$Result.GetResult<Prisma.$instagram_profilesPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Instagram_profiles that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {instagram_profilesFindFirstOrThrowArgs} args - Arguments to find a Instagram_profiles
     * @example
     * // Get one Instagram_profiles
     * const instagram_profiles = await prisma.instagram_profiles.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends instagram_profilesFindFirstOrThrowArgs>(args?: SelectSubset<T, instagram_profilesFindFirstOrThrowArgs<ExtArgs>>): Prisma__instagram_profilesClient<$Result.GetResult<Prisma.$instagram_profilesPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Instagram_profiles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {instagram_profilesFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Instagram_profiles
     * const instagram_profiles = await prisma.instagram_profiles.findMany()
     * 
     * // Get first 10 Instagram_profiles
     * const instagram_profiles = await prisma.instagram_profiles.findMany({ take: 10 })
     * 
     * // Only select the `username`
     * const instagram_profilesWithUsernameOnly = await prisma.instagram_profiles.findMany({ select: { username: true } })
     * 
     */
    findMany<T extends instagram_profilesFindManyArgs>(args?: SelectSubset<T, instagram_profilesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$instagram_profilesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Instagram_profiles.
     * @param {instagram_profilesCreateArgs} args - Arguments to create a Instagram_profiles.
     * @example
     * // Create one Instagram_profiles
     * const Instagram_profiles = await prisma.instagram_profiles.create({
     *   data: {
     *     // ... data to create a Instagram_profiles
     *   }
     * })
     * 
     */
    create<T extends instagram_profilesCreateArgs>(args: SelectSubset<T, instagram_profilesCreateArgs<ExtArgs>>): Prisma__instagram_profilesClient<$Result.GetResult<Prisma.$instagram_profilesPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Instagram_profiles.
     * @param {instagram_profilesCreateManyArgs} args - Arguments to create many Instagram_profiles.
     * @example
     * // Create many Instagram_profiles
     * const instagram_profiles = await prisma.instagram_profiles.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends instagram_profilesCreateManyArgs>(args?: SelectSubset<T, instagram_profilesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Instagram_profiles and returns the data saved in the database.
     * @param {instagram_profilesCreateManyAndReturnArgs} args - Arguments to create many Instagram_profiles.
     * @example
     * // Create many Instagram_profiles
     * const instagram_profiles = await prisma.instagram_profiles.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Instagram_profiles and only return the `username`
     * const instagram_profilesWithUsernameOnly = await prisma.instagram_profiles.createManyAndReturn({
     *   select: { username: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends instagram_profilesCreateManyAndReturnArgs>(args?: SelectSubset<T, instagram_profilesCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$instagram_profilesPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Instagram_profiles.
     * @param {instagram_profilesDeleteArgs} args - Arguments to delete one Instagram_profiles.
     * @example
     * // Delete one Instagram_profiles
     * const Instagram_profiles = await prisma.instagram_profiles.delete({
     *   where: {
     *     // ... filter to delete one Instagram_profiles
     *   }
     * })
     * 
     */
    delete<T extends instagram_profilesDeleteArgs>(args: SelectSubset<T, instagram_profilesDeleteArgs<ExtArgs>>): Prisma__instagram_profilesClient<$Result.GetResult<Prisma.$instagram_profilesPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Instagram_profiles.
     * @param {instagram_profilesUpdateArgs} args - Arguments to update one Instagram_profiles.
     * @example
     * // Update one Instagram_profiles
     * const instagram_profiles = await prisma.instagram_profiles.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends instagram_profilesUpdateArgs>(args: SelectSubset<T, instagram_profilesUpdateArgs<ExtArgs>>): Prisma__instagram_profilesClient<$Result.GetResult<Prisma.$instagram_profilesPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Instagram_profiles.
     * @param {instagram_profilesDeleteManyArgs} args - Arguments to filter Instagram_profiles to delete.
     * @example
     * // Delete a few Instagram_profiles
     * const { count } = await prisma.instagram_profiles.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends instagram_profilesDeleteManyArgs>(args?: SelectSubset<T, instagram_profilesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Instagram_profiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {instagram_profilesUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Instagram_profiles
     * const instagram_profiles = await prisma.instagram_profiles.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends instagram_profilesUpdateManyArgs>(args: SelectSubset<T, instagram_profilesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Instagram_profiles and returns the data updated in the database.
     * @param {instagram_profilesUpdateManyAndReturnArgs} args - Arguments to update many Instagram_profiles.
     * @example
     * // Update many Instagram_profiles
     * const instagram_profiles = await prisma.instagram_profiles.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Instagram_profiles and only return the `username`
     * const instagram_profilesWithUsernameOnly = await prisma.instagram_profiles.updateManyAndReturn({
     *   select: { username: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends instagram_profilesUpdateManyAndReturnArgs>(args: SelectSubset<T, instagram_profilesUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$instagram_profilesPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Instagram_profiles.
     * @param {instagram_profilesUpsertArgs} args - Arguments to update or create a Instagram_profiles.
     * @example
     * // Update or create a Instagram_profiles
     * const instagram_profiles = await prisma.instagram_profiles.upsert({
     *   create: {
     *     // ... data to create a Instagram_profiles
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Instagram_profiles we want to update
     *   }
     * })
     */
    upsert<T extends instagram_profilesUpsertArgs>(args: SelectSubset<T, instagram_profilesUpsertArgs<ExtArgs>>): Prisma__instagram_profilesClient<$Result.GetResult<Prisma.$instagram_profilesPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Instagram_profiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {instagram_profilesCountArgs} args - Arguments to filter Instagram_profiles to count.
     * @example
     * // Count the number of Instagram_profiles
     * const count = await prisma.instagram_profiles.count({
     *   where: {
     *     // ... the filter for the Instagram_profiles we want to count
     *   }
     * })
    **/
    count<T extends instagram_profilesCountArgs>(
      args?: Subset<T, instagram_profilesCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Instagram_profilesCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Instagram_profiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Instagram_profilesAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Instagram_profilesAggregateArgs>(args: Subset<T, Instagram_profilesAggregateArgs>): Prisma.PrismaPromise<GetInstagram_profilesAggregateType<T>>

    /**
     * Group by Instagram_profiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {instagram_profilesGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends instagram_profilesGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: instagram_profilesGroupByArgs['orderBy'] }
        : { orderBy?: instagram_profilesGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, instagram_profilesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInstagram_profilesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the instagram_profiles model
   */
  readonly fields: instagram_profilesFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for instagram_profiles.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__instagram_profilesClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the instagram_profiles model
   */
  interface instagram_profilesFieldRefs {
    readonly username: FieldRef<"instagram_profiles", 'String'>
    readonly biography: FieldRef<"instagram_profiles", 'String'>
    readonly category_name: FieldRef<"instagram_profiles", 'String'>
    readonly external_url: FieldRef<"instagram_profiles", 'String'>
    readonly followers: FieldRef<"instagram_profiles", 'Int'>
    readonly following: FieldRef<"instagram_profiles", 'Int'>
    readonly full_name: FieldRef<"instagram_profiles", 'String'>
    readonly is_private: FieldRef<"instagram_profiles", 'Boolean'>
    readonly is_verified: FieldRef<"instagram_profiles", 'Boolean'>
    readonly media_count: FieldRef<"instagram_profiles", 'Int'>
    readonly profile_pic_url: FieldRef<"instagram_profiles", 'String'>
    readonly updated_at: FieldRef<"instagram_profiles", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * instagram_profiles findUnique
   */
  export type instagram_profilesFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the instagram_profiles
     */
    select?: instagram_profilesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the instagram_profiles
     */
    omit?: instagram_profilesOmit<ExtArgs> | null
    /**
     * Filter, which instagram_profiles to fetch.
     */
    where: instagram_profilesWhereUniqueInput
  }

  /**
   * instagram_profiles findUniqueOrThrow
   */
  export type instagram_profilesFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the instagram_profiles
     */
    select?: instagram_profilesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the instagram_profiles
     */
    omit?: instagram_profilesOmit<ExtArgs> | null
    /**
     * Filter, which instagram_profiles to fetch.
     */
    where: instagram_profilesWhereUniqueInput
  }

  /**
   * instagram_profiles findFirst
   */
  export type instagram_profilesFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the instagram_profiles
     */
    select?: instagram_profilesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the instagram_profiles
     */
    omit?: instagram_profilesOmit<ExtArgs> | null
    /**
     * Filter, which instagram_profiles to fetch.
     */
    where?: instagram_profilesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of instagram_profiles to fetch.
     */
    orderBy?: instagram_profilesOrderByWithRelationInput | instagram_profilesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for instagram_profiles.
     */
    cursor?: instagram_profilesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` instagram_profiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` instagram_profiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of instagram_profiles.
     */
    distinct?: Instagram_profilesScalarFieldEnum | Instagram_profilesScalarFieldEnum[]
  }

  /**
   * instagram_profiles findFirstOrThrow
   */
  export type instagram_profilesFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the instagram_profiles
     */
    select?: instagram_profilesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the instagram_profiles
     */
    omit?: instagram_profilesOmit<ExtArgs> | null
    /**
     * Filter, which instagram_profiles to fetch.
     */
    where?: instagram_profilesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of instagram_profiles to fetch.
     */
    orderBy?: instagram_profilesOrderByWithRelationInput | instagram_profilesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for instagram_profiles.
     */
    cursor?: instagram_profilesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` instagram_profiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` instagram_profiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of instagram_profiles.
     */
    distinct?: Instagram_profilesScalarFieldEnum | Instagram_profilesScalarFieldEnum[]
  }

  /**
   * instagram_profiles findMany
   */
  export type instagram_profilesFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the instagram_profiles
     */
    select?: instagram_profilesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the instagram_profiles
     */
    omit?: instagram_profilesOmit<ExtArgs> | null
    /**
     * Filter, which instagram_profiles to fetch.
     */
    where?: instagram_profilesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of instagram_profiles to fetch.
     */
    orderBy?: instagram_profilesOrderByWithRelationInput | instagram_profilesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing instagram_profiles.
     */
    cursor?: instagram_profilesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` instagram_profiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` instagram_profiles.
     */
    skip?: number
    distinct?: Instagram_profilesScalarFieldEnum | Instagram_profilesScalarFieldEnum[]
  }

  /**
   * instagram_profiles create
   */
  export type instagram_profilesCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the instagram_profiles
     */
    select?: instagram_profilesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the instagram_profiles
     */
    omit?: instagram_profilesOmit<ExtArgs> | null
    /**
     * The data needed to create a instagram_profiles.
     */
    data: XOR<instagram_profilesCreateInput, instagram_profilesUncheckedCreateInput>
  }

  /**
   * instagram_profiles createMany
   */
  export type instagram_profilesCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many instagram_profiles.
     */
    data: instagram_profilesCreateManyInput | instagram_profilesCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * instagram_profiles createManyAndReturn
   */
  export type instagram_profilesCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the instagram_profiles
     */
    select?: instagram_profilesSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the instagram_profiles
     */
    omit?: instagram_profilesOmit<ExtArgs> | null
    /**
     * The data used to create many instagram_profiles.
     */
    data: instagram_profilesCreateManyInput | instagram_profilesCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * instagram_profiles update
   */
  export type instagram_profilesUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the instagram_profiles
     */
    select?: instagram_profilesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the instagram_profiles
     */
    omit?: instagram_profilesOmit<ExtArgs> | null
    /**
     * The data needed to update a instagram_profiles.
     */
    data: XOR<instagram_profilesUpdateInput, instagram_profilesUncheckedUpdateInput>
    /**
     * Choose, which instagram_profiles to update.
     */
    where: instagram_profilesWhereUniqueInput
  }

  /**
   * instagram_profiles updateMany
   */
  export type instagram_profilesUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update instagram_profiles.
     */
    data: XOR<instagram_profilesUpdateManyMutationInput, instagram_profilesUncheckedUpdateManyInput>
    /**
     * Filter which instagram_profiles to update
     */
    where?: instagram_profilesWhereInput
    /**
     * Limit how many instagram_profiles to update.
     */
    limit?: number
  }

  /**
   * instagram_profiles updateManyAndReturn
   */
  export type instagram_profilesUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the instagram_profiles
     */
    select?: instagram_profilesSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the instagram_profiles
     */
    omit?: instagram_profilesOmit<ExtArgs> | null
    /**
     * The data used to update instagram_profiles.
     */
    data: XOR<instagram_profilesUpdateManyMutationInput, instagram_profilesUncheckedUpdateManyInput>
    /**
     * Filter which instagram_profiles to update
     */
    where?: instagram_profilesWhereInput
    /**
     * Limit how many instagram_profiles to update.
     */
    limit?: number
  }

  /**
   * instagram_profiles upsert
   */
  export type instagram_profilesUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the instagram_profiles
     */
    select?: instagram_profilesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the instagram_profiles
     */
    omit?: instagram_profilesOmit<ExtArgs> | null
    /**
     * The filter to search for the instagram_profiles to update in case it exists.
     */
    where: instagram_profilesWhereUniqueInput
    /**
     * In case the instagram_profiles found by the `where` argument doesn't exist, create a new instagram_profiles with this data.
     */
    create: XOR<instagram_profilesCreateInput, instagram_profilesUncheckedCreateInput>
    /**
     * In case the instagram_profiles was found with the provided `where` argument, update it with this data.
     */
    update: XOR<instagram_profilesUpdateInput, instagram_profilesUncheckedUpdateInput>
  }

  /**
   * instagram_profiles delete
   */
  export type instagram_profilesDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the instagram_profiles
     */
    select?: instagram_profilesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the instagram_profiles
     */
    omit?: instagram_profilesOmit<ExtArgs> | null
    /**
     * Filter which instagram_profiles to delete.
     */
    where: instagram_profilesWhereUniqueInput
  }

  /**
   * instagram_profiles deleteMany
   */
  export type instagram_profilesDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which instagram_profiles to delete
     */
    where?: instagram_profilesWhereInput
    /**
     * Limit how many instagram_profiles to delete.
     */
    limit?: number
  }

  /**
   * instagram_profiles without action
   */
  export type instagram_profilesDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the instagram_profiles
     */
    select?: instagram_profilesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the instagram_profiles
     */
    omit?: instagram_profilesOmit<ExtArgs> | null
  }


  /**
   * Model sync_state
   */

  export type AggregateSync_state = {
    _count: Sync_stateCountAggregateOutputType | null
    _min: Sync_stateMinAggregateOutputType | null
    _max: Sync_stateMaxAggregateOutputType | null
  }

  export type Sync_stateMinAggregateOutputType = {
    state_key: string | null
    state_value: string | null
    updated_at: Date | null
  }

  export type Sync_stateMaxAggregateOutputType = {
    state_key: string | null
    state_value: string | null
    updated_at: Date | null
  }

  export type Sync_stateCountAggregateOutputType = {
    state_key: number
    state_value: number
    updated_at: number
    _all: number
  }


  export type Sync_stateMinAggregateInputType = {
    state_key?: true
    state_value?: true
    updated_at?: true
  }

  export type Sync_stateMaxAggregateInputType = {
    state_key?: true
    state_value?: true
    updated_at?: true
  }

  export type Sync_stateCountAggregateInputType = {
    state_key?: true
    state_value?: true
    updated_at?: true
    _all?: true
  }

  export type Sync_stateAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which sync_state to aggregate.
     */
    where?: sync_stateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of sync_states to fetch.
     */
    orderBy?: sync_stateOrderByWithRelationInput | sync_stateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: sync_stateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` sync_states from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` sync_states.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned sync_states
    **/
    _count?: true | Sync_stateCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Sync_stateMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Sync_stateMaxAggregateInputType
  }

  export type GetSync_stateAggregateType<T extends Sync_stateAggregateArgs> = {
        [P in keyof T & keyof AggregateSync_state]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSync_state[P]>
      : GetScalarType<T[P], AggregateSync_state[P]>
  }




  export type sync_stateGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: sync_stateWhereInput
    orderBy?: sync_stateOrderByWithAggregationInput | sync_stateOrderByWithAggregationInput[]
    by: Sync_stateScalarFieldEnum[] | Sync_stateScalarFieldEnum
    having?: sync_stateScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Sync_stateCountAggregateInputType | true
    _min?: Sync_stateMinAggregateInputType
    _max?: Sync_stateMaxAggregateInputType
  }

  export type Sync_stateGroupByOutputType = {
    state_key: string
    state_value: string
    updated_at: Date
    _count: Sync_stateCountAggregateOutputType | null
    _min: Sync_stateMinAggregateOutputType | null
    _max: Sync_stateMaxAggregateOutputType | null
  }

  type GetSync_stateGroupByPayload<T extends sync_stateGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Sync_stateGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Sync_stateGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Sync_stateGroupByOutputType[P]>
            : GetScalarType<T[P], Sync_stateGroupByOutputType[P]>
        }
      >
    >


  export type sync_stateSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    state_key?: boolean
    state_value?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["sync_state"]>

  export type sync_stateSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    state_key?: boolean
    state_value?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["sync_state"]>

  export type sync_stateSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    state_key?: boolean
    state_value?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["sync_state"]>

  export type sync_stateSelectScalar = {
    state_key?: boolean
    state_value?: boolean
    updated_at?: boolean
  }

  export type sync_stateOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"state_key" | "state_value" | "updated_at", ExtArgs["result"]["sync_state"]>

  export type $sync_statePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "sync_state"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      state_key: string
      state_value: string
      updated_at: Date
    }, ExtArgs["result"]["sync_state"]>
    composites: {}
  }

  type sync_stateGetPayload<S extends boolean | null | undefined | sync_stateDefaultArgs> = $Result.GetResult<Prisma.$sync_statePayload, S>

  type sync_stateCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<sync_stateFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Sync_stateCountAggregateInputType | true
    }

  export interface sync_stateDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['sync_state'], meta: { name: 'sync_state' } }
    /**
     * Find zero or one Sync_state that matches the filter.
     * @param {sync_stateFindUniqueArgs} args - Arguments to find a Sync_state
     * @example
     * // Get one Sync_state
     * const sync_state = await prisma.sync_state.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends sync_stateFindUniqueArgs>(args: SelectSubset<T, sync_stateFindUniqueArgs<ExtArgs>>): Prisma__sync_stateClient<$Result.GetResult<Prisma.$sync_statePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Sync_state that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {sync_stateFindUniqueOrThrowArgs} args - Arguments to find a Sync_state
     * @example
     * // Get one Sync_state
     * const sync_state = await prisma.sync_state.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends sync_stateFindUniqueOrThrowArgs>(args: SelectSubset<T, sync_stateFindUniqueOrThrowArgs<ExtArgs>>): Prisma__sync_stateClient<$Result.GetResult<Prisma.$sync_statePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Sync_state that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {sync_stateFindFirstArgs} args - Arguments to find a Sync_state
     * @example
     * // Get one Sync_state
     * const sync_state = await prisma.sync_state.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends sync_stateFindFirstArgs>(args?: SelectSubset<T, sync_stateFindFirstArgs<ExtArgs>>): Prisma__sync_stateClient<$Result.GetResult<Prisma.$sync_statePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Sync_state that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {sync_stateFindFirstOrThrowArgs} args - Arguments to find a Sync_state
     * @example
     * // Get one Sync_state
     * const sync_state = await prisma.sync_state.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends sync_stateFindFirstOrThrowArgs>(args?: SelectSubset<T, sync_stateFindFirstOrThrowArgs<ExtArgs>>): Prisma__sync_stateClient<$Result.GetResult<Prisma.$sync_statePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Sync_states that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {sync_stateFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Sync_states
     * const sync_states = await prisma.sync_state.findMany()
     * 
     * // Get first 10 Sync_states
     * const sync_states = await prisma.sync_state.findMany({ take: 10 })
     * 
     * // Only select the `state_key`
     * const sync_stateWithState_keyOnly = await prisma.sync_state.findMany({ select: { state_key: true } })
     * 
     */
    findMany<T extends sync_stateFindManyArgs>(args?: SelectSubset<T, sync_stateFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$sync_statePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Sync_state.
     * @param {sync_stateCreateArgs} args - Arguments to create a Sync_state.
     * @example
     * // Create one Sync_state
     * const Sync_state = await prisma.sync_state.create({
     *   data: {
     *     // ... data to create a Sync_state
     *   }
     * })
     * 
     */
    create<T extends sync_stateCreateArgs>(args: SelectSubset<T, sync_stateCreateArgs<ExtArgs>>): Prisma__sync_stateClient<$Result.GetResult<Prisma.$sync_statePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Sync_states.
     * @param {sync_stateCreateManyArgs} args - Arguments to create many Sync_states.
     * @example
     * // Create many Sync_states
     * const sync_state = await prisma.sync_state.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends sync_stateCreateManyArgs>(args?: SelectSubset<T, sync_stateCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Sync_states and returns the data saved in the database.
     * @param {sync_stateCreateManyAndReturnArgs} args - Arguments to create many Sync_states.
     * @example
     * // Create many Sync_states
     * const sync_state = await prisma.sync_state.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Sync_states and only return the `state_key`
     * const sync_stateWithState_keyOnly = await prisma.sync_state.createManyAndReturn({
     *   select: { state_key: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends sync_stateCreateManyAndReturnArgs>(args?: SelectSubset<T, sync_stateCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$sync_statePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Sync_state.
     * @param {sync_stateDeleteArgs} args - Arguments to delete one Sync_state.
     * @example
     * // Delete one Sync_state
     * const Sync_state = await prisma.sync_state.delete({
     *   where: {
     *     // ... filter to delete one Sync_state
     *   }
     * })
     * 
     */
    delete<T extends sync_stateDeleteArgs>(args: SelectSubset<T, sync_stateDeleteArgs<ExtArgs>>): Prisma__sync_stateClient<$Result.GetResult<Prisma.$sync_statePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Sync_state.
     * @param {sync_stateUpdateArgs} args - Arguments to update one Sync_state.
     * @example
     * // Update one Sync_state
     * const sync_state = await prisma.sync_state.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends sync_stateUpdateArgs>(args: SelectSubset<T, sync_stateUpdateArgs<ExtArgs>>): Prisma__sync_stateClient<$Result.GetResult<Prisma.$sync_statePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Sync_states.
     * @param {sync_stateDeleteManyArgs} args - Arguments to filter Sync_states to delete.
     * @example
     * // Delete a few Sync_states
     * const { count } = await prisma.sync_state.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends sync_stateDeleteManyArgs>(args?: SelectSubset<T, sync_stateDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sync_states.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {sync_stateUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Sync_states
     * const sync_state = await prisma.sync_state.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends sync_stateUpdateManyArgs>(args: SelectSubset<T, sync_stateUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sync_states and returns the data updated in the database.
     * @param {sync_stateUpdateManyAndReturnArgs} args - Arguments to update many Sync_states.
     * @example
     * // Update many Sync_states
     * const sync_state = await prisma.sync_state.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Sync_states and only return the `state_key`
     * const sync_stateWithState_keyOnly = await prisma.sync_state.updateManyAndReturn({
     *   select: { state_key: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends sync_stateUpdateManyAndReturnArgs>(args: SelectSubset<T, sync_stateUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$sync_statePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Sync_state.
     * @param {sync_stateUpsertArgs} args - Arguments to update or create a Sync_state.
     * @example
     * // Update or create a Sync_state
     * const sync_state = await prisma.sync_state.upsert({
     *   create: {
     *     // ... data to create a Sync_state
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Sync_state we want to update
     *   }
     * })
     */
    upsert<T extends sync_stateUpsertArgs>(args: SelectSubset<T, sync_stateUpsertArgs<ExtArgs>>): Prisma__sync_stateClient<$Result.GetResult<Prisma.$sync_statePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Sync_states.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {sync_stateCountArgs} args - Arguments to filter Sync_states to count.
     * @example
     * // Count the number of Sync_states
     * const count = await prisma.sync_state.count({
     *   where: {
     *     // ... the filter for the Sync_states we want to count
     *   }
     * })
    **/
    count<T extends sync_stateCountArgs>(
      args?: Subset<T, sync_stateCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Sync_stateCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Sync_state.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Sync_stateAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Sync_stateAggregateArgs>(args: Subset<T, Sync_stateAggregateArgs>): Prisma.PrismaPromise<GetSync_stateAggregateType<T>>

    /**
     * Group by Sync_state.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {sync_stateGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends sync_stateGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: sync_stateGroupByArgs['orderBy'] }
        : { orderBy?: sync_stateGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, sync_stateGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSync_stateGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the sync_state model
   */
  readonly fields: sync_stateFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for sync_state.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__sync_stateClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the sync_state model
   */
  interface sync_stateFieldRefs {
    readonly state_key: FieldRef<"sync_state", 'String'>
    readonly state_value: FieldRef<"sync_state", 'String'>
    readonly updated_at: FieldRef<"sync_state", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * sync_state findUnique
   */
  export type sync_stateFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sync_state
     */
    select?: sync_stateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sync_state
     */
    omit?: sync_stateOmit<ExtArgs> | null
    /**
     * Filter, which sync_state to fetch.
     */
    where: sync_stateWhereUniqueInput
  }

  /**
   * sync_state findUniqueOrThrow
   */
  export type sync_stateFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sync_state
     */
    select?: sync_stateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sync_state
     */
    omit?: sync_stateOmit<ExtArgs> | null
    /**
     * Filter, which sync_state to fetch.
     */
    where: sync_stateWhereUniqueInput
  }

  /**
   * sync_state findFirst
   */
  export type sync_stateFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sync_state
     */
    select?: sync_stateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sync_state
     */
    omit?: sync_stateOmit<ExtArgs> | null
    /**
     * Filter, which sync_state to fetch.
     */
    where?: sync_stateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of sync_states to fetch.
     */
    orderBy?: sync_stateOrderByWithRelationInput | sync_stateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for sync_states.
     */
    cursor?: sync_stateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` sync_states from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` sync_states.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of sync_states.
     */
    distinct?: Sync_stateScalarFieldEnum | Sync_stateScalarFieldEnum[]
  }

  /**
   * sync_state findFirstOrThrow
   */
  export type sync_stateFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sync_state
     */
    select?: sync_stateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sync_state
     */
    omit?: sync_stateOmit<ExtArgs> | null
    /**
     * Filter, which sync_state to fetch.
     */
    where?: sync_stateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of sync_states to fetch.
     */
    orderBy?: sync_stateOrderByWithRelationInput | sync_stateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for sync_states.
     */
    cursor?: sync_stateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` sync_states from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` sync_states.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of sync_states.
     */
    distinct?: Sync_stateScalarFieldEnum | Sync_stateScalarFieldEnum[]
  }

  /**
   * sync_state findMany
   */
  export type sync_stateFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sync_state
     */
    select?: sync_stateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sync_state
     */
    omit?: sync_stateOmit<ExtArgs> | null
    /**
     * Filter, which sync_states to fetch.
     */
    where?: sync_stateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of sync_states to fetch.
     */
    orderBy?: sync_stateOrderByWithRelationInput | sync_stateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing sync_states.
     */
    cursor?: sync_stateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` sync_states from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` sync_states.
     */
    skip?: number
    distinct?: Sync_stateScalarFieldEnum | Sync_stateScalarFieldEnum[]
  }

  /**
   * sync_state create
   */
  export type sync_stateCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sync_state
     */
    select?: sync_stateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sync_state
     */
    omit?: sync_stateOmit<ExtArgs> | null
    /**
     * The data needed to create a sync_state.
     */
    data: XOR<sync_stateCreateInput, sync_stateUncheckedCreateInput>
  }

  /**
   * sync_state createMany
   */
  export type sync_stateCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many sync_states.
     */
    data: sync_stateCreateManyInput | sync_stateCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * sync_state createManyAndReturn
   */
  export type sync_stateCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sync_state
     */
    select?: sync_stateSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the sync_state
     */
    omit?: sync_stateOmit<ExtArgs> | null
    /**
     * The data used to create many sync_states.
     */
    data: sync_stateCreateManyInput | sync_stateCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * sync_state update
   */
  export type sync_stateUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sync_state
     */
    select?: sync_stateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sync_state
     */
    omit?: sync_stateOmit<ExtArgs> | null
    /**
     * The data needed to update a sync_state.
     */
    data: XOR<sync_stateUpdateInput, sync_stateUncheckedUpdateInput>
    /**
     * Choose, which sync_state to update.
     */
    where: sync_stateWhereUniqueInput
  }

  /**
   * sync_state updateMany
   */
  export type sync_stateUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update sync_states.
     */
    data: XOR<sync_stateUpdateManyMutationInput, sync_stateUncheckedUpdateManyInput>
    /**
     * Filter which sync_states to update
     */
    where?: sync_stateWhereInput
    /**
     * Limit how many sync_states to update.
     */
    limit?: number
  }

  /**
   * sync_state updateManyAndReturn
   */
  export type sync_stateUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sync_state
     */
    select?: sync_stateSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the sync_state
     */
    omit?: sync_stateOmit<ExtArgs> | null
    /**
     * The data used to update sync_states.
     */
    data: XOR<sync_stateUpdateManyMutationInput, sync_stateUncheckedUpdateManyInput>
    /**
     * Filter which sync_states to update
     */
    where?: sync_stateWhereInput
    /**
     * Limit how many sync_states to update.
     */
    limit?: number
  }

  /**
   * sync_state upsert
   */
  export type sync_stateUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sync_state
     */
    select?: sync_stateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sync_state
     */
    omit?: sync_stateOmit<ExtArgs> | null
    /**
     * The filter to search for the sync_state to update in case it exists.
     */
    where: sync_stateWhereUniqueInput
    /**
     * In case the sync_state found by the `where` argument doesn't exist, create a new sync_state with this data.
     */
    create: XOR<sync_stateCreateInput, sync_stateUncheckedCreateInput>
    /**
     * In case the sync_state was found with the provided `where` argument, update it with this data.
     */
    update: XOR<sync_stateUpdateInput, sync_stateUncheckedUpdateInput>
  }

  /**
   * sync_state delete
   */
  export type sync_stateDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sync_state
     */
    select?: sync_stateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sync_state
     */
    omit?: sync_stateOmit<ExtArgs> | null
    /**
     * Filter which sync_state to delete.
     */
    where: sync_stateWhereUniqueInput
  }

  /**
   * sync_state deleteMany
   */
  export type sync_stateDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which sync_states to delete
     */
    where?: sync_stateWhereInput
    /**
     * Limit how many sync_states to delete.
     */
    limit?: number
  }

  /**
   * sync_state without action
   */
  export type sync_stateDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the sync_state
     */
    select?: sync_stateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the sync_state
     */
    omit?: sync_stateOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const InfluencerScalarFieldEnum: {
    username: 'username',
    accountId: 'accountId',
    email: 'email',
    name: 'name',
    bio: 'bio',
    followers: 'followers',
    ageGroup: 'ageGroup',
    profileLink: 'profileLink',
    categories: 'categories',
    hasLinks: 'hasLinks',
    uploadFreq: 'uploadFreq',
    recentAvgViews: 'recentAvgViews',
    captureLinks: 'captureLinks',
    pinnedAvgViews: 'pinnedAvgViews',
    recent18AvgViews: 'recent18AvgViews',
    recentAds: 'recentAds',
    contactMethod: 'contactMethod',
    updated_at: 'updated_at',
    platform: 'platform',
    priority_score: 'priority_score',
    priority_tier: 'priority_tier',
    track_history: 'track_history',
    update_interval_minutes: 'update_interval_minutes'
  };

  export type InfluencerScalarFieldEnum = (typeof InfluencerScalarFieldEnum)[keyof typeof InfluencerScalarFieldEnum]


  export const Instagram_keyword_cacheScalarFieldEnum: {
    id: 'id',
    categories: 'categories',
    keywords: 'keywords',
    prompt_version: 'prompt_version',
    updated_at: 'updated_at',
    username: 'username'
  };

  export type Instagram_keyword_cacheScalarFieldEnum = (typeof Instagram_keyword_cacheScalarFieldEnum)[keyof typeof Instagram_keyword_cacheScalarFieldEnum]


  export const Instagram_postsScalarFieldEnum: {
    post_id: 'post_id',
    caption: 'caption',
    comment_count: 'comment_count',
    display_url: 'display_url',
    is_video: 'is_video',
    like_count: 'like_count',
    media_type: 'media_type',
    permalink: 'permalink',
    shortcode: 'shortcode',
    taken_at: 'taken_at',
    thumbnail_url: 'thumbnail_url',
    updated_at: 'updated_at',
    username: 'username',
    video_view_count: 'video_view_count'
  };

  export type Instagram_postsScalarFieldEnum = (typeof Instagram_postsScalarFieldEnum)[keyof typeof Instagram_postsScalarFieldEnum]


  export const Instagram_profilesScalarFieldEnum: {
    username: 'username',
    biography: 'biography',
    category_name: 'category_name',
    external_url: 'external_url',
    followers: 'followers',
    following: 'following',
    full_name: 'full_name',
    is_private: 'is_private',
    is_verified: 'is_verified',
    media_count: 'media_count',
    profile_pic_url: 'profile_pic_url',
    updated_at: 'updated_at'
  };

  export type Instagram_profilesScalarFieldEnum = (typeof Instagram_profilesScalarFieldEnum)[keyof typeof Instagram_profilesScalarFieldEnum]


  export const Sync_stateScalarFieldEnum: {
    state_key: 'state_key',
    state_value: 'state_value',
    updated_at: 'updated_at'
  };

  export type Sync_stateScalarFieldEnum = (typeof Sync_stateScalarFieldEnum)[keyof typeof Sync_stateScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'BigInt'
   */
  export type BigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt'>
    


  /**
   * Reference to a field of type 'BigInt[]'
   */
  export type ListBigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type influencerWhereInput = {
    AND?: influencerWhereInput | influencerWhereInput[]
    OR?: influencerWhereInput[]
    NOT?: influencerWhereInput | influencerWhereInput[]
    username?: StringFilter<"influencer"> | string
    accountId?: BigIntNullableFilter<"influencer"> | bigint | number | null
    email?: StringNullableFilter<"influencer"> | string | null
    name?: StringNullableFilter<"influencer"> | string | null
    bio?: StringNullableFilter<"influencer"> | string | null
    followers?: BigIntNullableFilter<"influencer"> | bigint | number | null
    ageGroup?: StringNullableFilter<"influencer"> | string | null
    profileLink?: StringNullableFilter<"influencer"> | string | null
    categories?: StringNullableFilter<"influencer"> | string | null
    hasLinks?: BoolNullableFilter<"influencer"> | boolean | null
    uploadFreq?: StringNullableFilter<"influencer"> | string | null
    recentAvgViews?: BigIntNullableFilter<"influencer"> | bigint | number | null
    captureLinks?: StringNullableFilter<"influencer"> | string | null
    pinnedAvgViews?: BigIntNullableFilter<"influencer"> | bigint | number | null
    recent18AvgViews?: BigIntNullableFilter<"influencer"> | bigint | number | null
    recentAds?: StringNullableFilter<"influencer"> | string | null
    contactMethod?: StringNullableFilter<"influencer"> | string | null
    updated_at?: DateTimeNullableFilter<"influencer"> | Date | string | null
    platform?: StringFilter<"influencer"> | string
    priority_score?: IntNullableFilter<"influencer"> | number | null
    priority_tier?: StringNullableFilter<"influencer"> | string | null
    track_history?: BoolNullableFilter<"influencer"> | boolean | null
    update_interval_minutes?: IntNullableFilter<"influencer"> | number | null
  }

  export type influencerOrderByWithRelationInput = {
    username?: SortOrder
    accountId?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    name?: SortOrderInput | SortOrder
    bio?: SortOrderInput | SortOrder
    followers?: SortOrderInput | SortOrder
    ageGroup?: SortOrderInput | SortOrder
    profileLink?: SortOrderInput | SortOrder
    categories?: SortOrderInput | SortOrder
    hasLinks?: SortOrderInput | SortOrder
    uploadFreq?: SortOrderInput | SortOrder
    recentAvgViews?: SortOrderInput | SortOrder
    captureLinks?: SortOrderInput | SortOrder
    pinnedAvgViews?: SortOrderInput | SortOrder
    recent18AvgViews?: SortOrderInput | SortOrder
    recentAds?: SortOrderInput | SortOrder
    contactMethod?: SortOrderInput | SortOrder
    updated_at?: SortOrderInput | SortOrder
    platform?: SortOrder
    priority_score?: SortOrderInput | SortOrder
    priority_tier?: SortOrderInput | SortOrder
    track_history?: SortOrderInput | SortOrder
    update_interval_minutes?: SortOrderInput | SortOrder
  }

  export type influencerWhereUniqueInput = Prisma.AtLeast<{
    platform_username?: influencerPlatformUsernameCompoundUniqueInput
    AND?: influencerWhereInput | influencerWhereInput[]
    OR?: influencerWhereInput[]
    NOT?: influencerWhereInput | influencerWhereInput[]
    username?: StringFilter<"influencer"> | string
    accountId?: BigIntNullableFilter<"influencer"> | bigint | number | null
    email?: StringNullableFilter<"influencer"> | string | null
    name?: StringNullableFilter<"influencer"> | string | null
    bio?: StringNullableFilter<"influencer"> | string | null
    followers?: BigIntNullableFilter<"influencer"> | bigint | number | null
    ageGroup?: StringNullableFilter<"influencer"> | string | null
    profileLink?: StringNullableFilter<"influencer"> | string | null
    categories?: StringNullableFilter<"influencer"> | string | null
    hasLinks?: BoolNullableFilter<"influencer"> | boolean | null
    uploadFreq?: StringNullableFilter<"influencer"> | string | null
    recentAvgViews?: BigIntNullableFilter<"influencer"> | bigint | number | null
    captureLinks?: StringNullableFilter<"influencer"> | string | null
    pinnedAvgViews?: BigIntNullableFilter<"influencer"> | bigint | number | null
    recent18AvgViews?: BigIntNullableFilter<"influencer"> | bigint | number | null
    recentAds?: StringNullableFilter<"influencer"> | string | null
    contactMethod?: StringNullableFilter<"influencer"> | string | null
    updated_at?: DateTimeNullableFilter<"influencer"> | Date | string | null
    platform?: StringFilter<"influencer"> | string
    priority_score?: IntNullableFilter<"influencer"> | number | null
    priority_tier?: StringNullableFilter<"influencer"> | string | null
    track_history?: BoolNullableFilter<"influencer"> | boolean | null
    update_interval_minutes?: IntNullableFilter<"influencer"> | number | null
  }, "platform_username">

  export type influencerOrderByWithAggregationInput = {
    username?: SortOrder
    accountId?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    name?: SortOrderInput | SortOrder
    bio?: SortOrderInput | SortOrder
    followers?: SortOrderInput | SortOrder
    ageGroup?: SortOrderInput | SortOrder
    profileLink?: SortOrderInput | SortOrder
    categories?: SortOrderInput | SortOrder
    hasLinks?: SortOrderInput | SortOrder
    uploadFreq?: SortOrderInput | SortOrder
    recentAvgViews?: SortOrderInput | SortOrder
    captureLinks?: SortOrderInput | SortOrder
    pinnedAvgViews?: SortOrderInput | SortOrder
    recent18AvgViews?: SortOrderInput | SortOrder
    recentAds?: SortOrderInput | SortOrder
    contactMethod?: SortOrderInput | SortOrder
    updated_at?: SortOrderInput | SortOrder
    platform?: SortOrder
    priority_score?: SortOrderInput | SortOrder
    priority_tier?: SortOrderInput | SortOrder
    track_history?: SortOrderInput | SortOrder
    update_interval_minutes?: SortOrderInput | SortOrder
    _count?: influencerCountOrderByAggregateInput
    _avg?: influencerAvgOrderByAggregateInput
    _max?: influencerMaxOrderByAggregateInput
    _min?: influencerMinOrderByAggregateInput
    _sum?: influencerSumOrderByAggregateInput
  }

  export type influencerScalarWhereWithAggregatesInput = {
    AND?: influencerScalarWhereWithAggregatesInput | influencerScalarWhereWithAggregatesInput[]
    OR?: influencerScalarWhereWithAggregatesInput[]
    NOT?: influencerScalarWhereWithAggregatesInput | influencerScalarWhereWithAggregatesInput[]
    username?: StringWithAggregatesFilter<"influencer"> | string
    accountId?: BigIntNullableWithAggregatesFilter<"influencer"> | bigint | number | null
    email?: StringNullableWithAggregatesFilter<"influencer"> | string | null
    name?: StringNullableWithAggregatesFilter<"influencer"> | string | null
    bio?: StringNullableWithAggregatesFilter<"influencer"> | string | null
    followers?: BigIntNullableWithAggregatesFilter<"influencer"> | bigint | number | null
    ageGroup?: StringNullableWithAggregatesFilter<"influencer"> | string | null
    profileLink?: StringNullableWithAggregatesFilter<"influencer"> | string | null
    categories?: StringNullableWithAggregatesFilter<"influencer"> | string | null
    hasLinks?: BoolNullableWithAggregatesFilter<"influencer"> | boolean | null
    uploadFreq?: StringNullableWithAggregatesFilter<"influencer"> | string | null
    recentAvgViews?: BigIntNullableWithAggregatesFilter<"influencer"> | bigint | number | null
    captureLinks?: StringNullableWithAggregatesFilter<"influencer"> | string | null
    pinnedAvgViews?: BigIntNullableWithAggregatesFilter<"influencer"> | bigint | number | null
    recent18AvgViews?: BigIntNullableWithAggregatesFilter<"influencer"> | bigint | number | null
    recentAds?: StringNullableWithAggregatesFilter<"influencer"> | string | null
    contactMethod?: StringNullableWithAggregatesFilter<"influencer"> | string | null
    updated_at?: DateTimeNullableWithAggregatesFilter<"influencer"> | Date | string | null
    platform?: StringWithAggregatesFilter<"influencer"> | string
    priority_score?: IntNullableWithAggregatesFilter<"influencer"> | number | null
    priority_tier?: StringNullableWithAggregatesFilter<"influencer"> | string | null
    track_history?: BoolNullableWithAggregatesFilter<"influencer"> | boolean | null
    update_interval_minutes?: IntNullableWithAggregatesFilter<"influencer"> | number | null
  }

  export type instagram_keyword_cacheWhereInput = {
    AND?: instagram_keyword_cacheWhereInput | instagram_keyword_cacheWhereInput[]
    OR?: instagram_keyword_cacheWhereInput[]
    NOT?: instagram_keyword_cacheWhereInput | instagram_keyword_cacheWhereInput[]
    id?: BigIntFilter<"instagram_keyword_cache"> | bigint | number
    categories?: StringNullableFilter<"instagram_keyword_cache"> | string | null
    keywords?: StringNullableFilter<"instagram_keyword_cache"> | string | null
    prompt_version?: StringFilter<"instagram_keyword_cache"> | string
    updated_at?: DateTimeNullableFilter<"instagram_keyword_cache"> | Date | string | null
    username?: StringFilter<"instagram_keyword_cache"> | string
  }

  export type instagram_keyword_cacheOrderByWithRelationInput = {
    id?: SortOrder
    categories?: SortOrderInput | SortOrder
    keywords?: SortOrderInput | SortOrder
    prompt_version?: SortOrder
    updated_at?: SortOrderInput | SortOrder
    username?: SortOrder
  }

  export type instagram_keyword_cacheWhereUniqueInput = Prisma.AtLeast<{
    id?: bigint | number
    username_prompt_version?: instagram_keyword_cacheUsernamePrompt_versionCompoundUniqueInput
    AND?: instagram_keyword_cacheWhereInput | instagram_keyword_cacheWhereInput[]
    OR?: instagram_keyword_cacheWhereInput[]
    NOT?: instagram_keyword_cacheWhereInput | instagram_keyword_cacheWhereInput[]
    categories?: StringNullableFilter<"instagram_keyword_cache"> | string | null
    keywords?: StringNullableFilter<"instagram_keyword_cache"> | string | null
    prompt_version?: StringFilter<"instagram_keyword_cache"> | string
    updated_at?: DateTimeNullableFilter<"instagram_keyword_cache"> | Date | string | null
    username?: StringFilter<"instagram_keyword_cache"> | string
  }, "id" | "username_prompt_version">

  export type instagram_keyword_cacheOrderByWithAggregationInput = {
    id?: SortOrder
    categories?: SortOrderInput | SortOrder
    keywords?: SortOrderInput | SortOrder
    prompt_version?: SortOrder
    updated_at?: SortOrderInput | SortOrder
    username?: SortOrder
    _count?: instagram_keyword_cacheCountOrderByAggregateInput
    _avg?: instagram_keyword_cacheAvgOrderByAggregateInput
    _max?: instagram_keyword_cacheMaxOrderByAggregateInput
    _min?: instagram_keyword_cacheMinOrderByAggregateInput
    _sum?: instagram_keyword_cacheSumOrderByAggregateInput
  }

  export type instagram_keyword_cacheScalarWhereWithAggregatesInput = {
    AND?: instagram_keyword_cacheScalarWhereWithAggregatesInput | instagram_keyword_cacheScalarWhereWithAggregatesInput[]
    OR?: instagram_keyword_cacheScalarWhereWithAggregatesInput[]
    NOT?: instagram_keyword_cacheScalarWhereWithAggregatesInput | instagram_keyword_cacheScalarWhereWithAggregatesInput[]
    id?: BigIntWithAggregatesFilter<"instagram_keyword_cache"> | bigint | number
    categories?: StringNullableWithAggregatesFilter<"instagram_keyword_cache"> | string | null
    keywords?: StringNullableWithAggregatesFilter<"instagram_keyword_cache"> | string | null
    prompt_version?: StringWithAggregatesFilter<"instagram_keyword_cache"> | string
    updated_at?: DateTimeNullableWithAggregatesFilter<"instagram_keyword_cache"> | Date | string | null
    username?: StringWithAggregatesFilter<"instagram_keyword_cache"> | string
  }

  export type instagram_postsWhereInput = {
    AND?: instagram_postsWhereInput | instagram_postsWhereInput[]
    OR?: instagram_postsWhereInput[]
    NOT?: instagram_postsWhereInput | instagram_postsWhereInput[]
    post_id?: StringFilter<"instagram_posts"> | string
    caption?: StringNullableFilter<"instagram_posts"> | string | null
    comment_count?: IntNullableFilter<"instagram_posts"> | number | null
    display_url?: StringNullableFilter<"instagram_posts"> | string | null
    is_video?: BoolNullableFilter<"instagram_posts"> | boolean | null
    like_count?: IntNullableFilter<"instagram_posts"> | number | null
    media_type?: StringNullableFilter<"instagram_posts"> | string | null
    permalink?: StringNullableFilter<"instagram_posts"> | string | null
    shortcode?: StringNullableFilter<"instagram_posts"> | string | null
    taken_at?: StringNullableFilter<"instagram_posts"> | string | null
    thumbnail_url?: StringNullableFilter<"instagram_posts"> | string | null
    updated_at?: DateTimeNullableFilter<"instagram_posts"> | Date | string | null
    username?: StringFilter<"instagram_posts"> | string
    video_view_count?: IntNullableFilter<"instagram_posts"> | number | null
  }

  export type instagram_postsOrderByWithRelationInput = {
    post_id?: SortOrder
    caption?: SortOrderInput | SortOrder
    comment_count?: SortOrderInput | SortOrder
    display_url?: SortOrderInput | SortOrder
    is_video?: SortOrderInput | SortOrder
    like_count?: SortOrderInput | SortOrder
    media_type?: SortOrderInput | SortOrder
    permalink?: SortOrderInput | SortOrder
    shortcode?: SortOrderInput | SortOrder
    taken_at?: SortOrderInput | SortOrder
    thumbnail_url?: SortOrderInput | SortOrder
    updated_at?: SortOrderInput | SortOrder
    username?: SortOrder
    video_view_count?: SortOrderInput | SortOrder
  }

  export type instagram_postsWhereUniqueInput = Prisma.AtLeast<{
    post_id?: string
    AND?: instagram_postsWhereInput | instagram_postsWhereInput[]
    OR?: instagram_postsWhereInput[]
    NOT?: instagram_postsWhereInput | instagram_postsWhereInput[]
    caption?: StringNullableFilter<"instagram_posts"> | string | null
    comment_count?: IntNullableFilter<"instagram_posts"> | number | null
    display_url?: StringNullableFilter<"instagram_posts"> | string | null
    is_video?: BoolNullableFilter<"instagram_posts"> | boolean | null
    like_count?: IntNullableFilter<"instagram_posts"> | number | null
    media_type?: StringNullableFilter<"instagram_posts"> | string | null
    permalink?: StringNullableFilter<"instagram_posts"> | string | null
    shortcode?: StringNullableFilter<"instagram_posts"> | string | null
    taken_at?: StringNullableFilter<"instagram_posts"> | string | null
    thumbnail_url?: StringNullableFilter<"instagram_posts"> | string | null
    updated_at?: DateTimeNullableFilter<"instagram_posts"> | Date | string | null
    username?: StringFilter<"instagram_posts"> | string
    video_view_count?: IntNullableFilter<"instagram_posts"> | number | null
  }, "post_id">

  export type instagram_postsOrderByWithAggregationInput = {
    post_id?: SortOrder
    caption?: SortOrderInput | SortOrder
    comment_count?: SortOrderInput | SortOrder
    display_url?: SortOrderInput | SortOrder
    is_video?: SortOrderInput | SortOrder
    like_count?: SortOrderInput | SortOrder
    media_type?: SortOrderInput | SortOrder
    permalink?: SortOrderInput | SortOrder
    shortcode?: SortOrderInput | SortOrder
    taken_at?: SortOrderInput | SortOrder
    thumbnail_url?: SortOrderInput | SortOrder
    updated_at?: SortOrderInput | SortOrder
    username?: SortOrder
    video_view_count?: SortOrderInput | SortOrder
    _count?: instagram_postsCountOrderByAggregateInput
    _avg?: instagram_postsAvgOrderByAggregateInput
    _max?: instagram_postsMaxOrderByAggregateInput
    _min?: instagram_postsMinOrderByAggregateInput
    _sum?: instagram_postsSumOrderByAggregateInput
  }

  export type instagram_postsScalarWhereWithAggregatesInput = {
    AND?: instagram_postsScalarWhereWithAggregatesInput | instagram_postsScalarWhereWithAggregatesInput[]
    OR?: instagram_postsScalarWhereWithAggregatesInput[]
    NOT?: instagram_postsScalarWhereWithAggregatesInput | instagram_postsScalarWhereWithAggregatesInput[]
    post_id?: StringWithAggregatesFilter<"instagram_posts"> | string
    caption?: StringNullableWithAggregatesFilter<"instagram_posts"> | string | null
    comment_count?: IntNullableWithAggregatesFilter<"instagram_posts"> | number | null
    display_url?: StringNullableWithAggregatesFilter<"instagram_posts"> | string | null
    is_video?: BoolNullableWithAggregatesFilter<"instagram_posts"> | boolean | null
    like_count?: IntNullableWithAggregatesFilter<"instagram_posts"> | number | null
    media_type?: StringNullableWithAggregatesFilter<"instagram_posts"> | string | null
    permalink?: StringNullableWithAggregatesFilter<"instagram_posts"> | string | null
    shortcode?: StringNullableWithAggregatesFilter<"instagram_posts"> | string | null
    taken_at?: StringNullableWithAggregatesFilter<"instagram_posts"> | string | null
    thumbnail_url?: StringNullableWithAggregatesFilter<"instagram_posts"> | string | null
    updated_at?: DateTimeNullableWithAggregatesFilter<"instagram_posts"> | Date | string | null
    username?: StringWithAggregatesFilter<"instagram_posts"> | string
    video_view_count?: IntNullableWithAggregatesFilter<"instagram_posts"> | number | null
  }

  export type instagram_profilesWhereInput = {
    AND?: instagram_profilesWhereInput | instagram_profilesWhereInput[]
    OR?: instagram_profilesWhereInput[]
    NOT?: instagram_profilesWhereInput | instagram_profilesWhereInput[]
    username?: StringFilter<"instagram_profiles"> | string
    biography?: StringNullableFilter<"instagram_profiles"> | string | null
    category_name?: StringNullableFilter<"instagram_profiles"> | string | null
    external_url?: StringNullableFilter<"instagram_profiles"> | string | null
    followers?: IntNullableFilter<"instagram_profiles"> | number | null
    following?: IntNullableFilter<"instagram_profiles"> | number | null
    full_name?: StringNullableFilter<"instagram_profiles"> | string | null
    is_private?: BoolNullableFilter<"instagram_profiles"> | boolean | null
    is_verified?: BoolNullableFilter<"instagram_profiles"> | boolean | null
    media_count?: IntNullableFilter<"instagram_profiles"> | number | null
    profile_pic_url?: StringNullableFilter<"instagram_profiles"> | string | null
    updated_at?: DateTimeNullableFilter<"instagram_profiles"> | Date | string | null
  }

  export type instagram_profilesOrderByWithRelationInput = {
    username?: SortOrder
    biography?: SortOrderInput | SortOrder
    category_name?: SortOrderInput | SortOrder
    external_url?: SortOrderInput | SortOrder
    followers?: SortOrderInput | SortOrder
    following?: SortOrderInput | SortOrder
    full_name?: SortOrderInput | SortOrder
    is_private?: SortOrderInput | SortOrder
    is_verified?: SortOrderInput | SortOrder
    media_count?: SortOrderInput | SortOrder
    profile_pic_url?: SortOrderInput | SortOrder
    updated_at?: SortOrderInput | SortOrder
  }

  export type instagram_profilesWhereUniqueInput = Prisma.AtLeast<{
    username?: string
    AND?: instagram_profilesWhereInput | instagram_profilesWhereInput[]
    OR?: instagram_profilesWhereInput[]
    NOT?: instagram_profilesWhereInput | instagram_profilesWhereInput[]
    biography?: StringNullableFilter<"instagram_profiles"> | string | null
    category_name?: StringNullableFilter<"instagram_profiles"> | string | null
    external_url?: StringNullableFilter<"instagram_profiles"> | string | null
    followers?: IntNullableFilter<"instagram_profiles"> | number | null
    following?: IntNullableFilter<"instagram_profiles"> | number | null
    full_name?: StringNullableFilter<"instagram_profiles"> | string | null
    is_private?: BoolNullableFilter<"instagram_profiles"> | boolean | null
    is_verified?: BoolNullableFilter<"instagram_profiles"> | boolean | null
    media_count?: IntNullableFilter<"instagram_profiles"> | number | null
    profile_pic_url?: StringNullableFilter<"instagram_profiles"> | string | null
    updated_at?: DateTimeNullableFilter<"instagram_profiles"> | Date | string | null
  }, "username">

  export type instagram_profilesOrderByWithAggregationInput = {
    username?: SortOrder
    biography?: SortOrderInput | SortOrder
    category_name?: SortOrderInput | SortOrder
    external_url?: SortOrderInput | SortOrder
    followers?: SortOrderInput | SortOrder
    following?: SortOrderInput | SortOrder
    full_name?: SortOrderInput | SortOrder
    is_private?: SortOrderInput | SortOrder
    is_verified?: SortOrderInput | SortOrder
    media_count?: SortOrderInput | SortOrder
    profile_pic_url?: SortOrderInput | SortOrder
    updated_at?: SortOrderInput | SortOrder
    _count?: instagram_profilesCountOrderByAggregateInput
    _avg?: instagram_profilesAvgOrderByAggregateInput
    _max?: instagram_profilesMaxOrderByAggregateInput
    _min?: instagram_profilesMinOrderByAggregateInput
    _sum?: instagram_profilesSumOrderByAggregateInput
  }

  export type instagram_profilesScalarWhereWithAggregatesInput = {
    AND?: instagram_profilesScalarWhereWithAggregatesInput | instagram_profilesScalarWhereWithAggregatesInput[]
    OR?: instagram_profilesScalarWhereWithAggregatesInput[]
    NOT?: instagram_profilesScalarWhereWithAggregatesInput | instagram_profilesScalarWhereWithAggregatesInput[]
    username?: StringWithAggregatesFilter<"instagram_profiles"> | string
    biography?: StringNullableWithAggregatesFilter<"instagram_profiles"> | string | null
    category_name?: StringNullableWithAggregatesFilter<"instagram_profiles"> | string | null
    external_url?: StringNullableWithAggregatesFilter<"instagram_profiles"> | string | null
    followers?: IntNullableWithAggregatesFilter<"instagram_profiles"> | number | null
    following?: IntNullableWithAggregatesFilter<"instagram_profiles"> | number | null
    full_name?: StringNullableWithAggregatesFilter<"instagram_profiles"> | string | null
    is_private?: BoolNullableWithAggregatesFilter<"instagram_profiles"> | boolean | null
    is_verified?: BoolNullableWithAggregatesFilter<"instagram_profiles"> | boolean | null
    media_count?: IntNullableWithAggregatesFilter<"instagram_profiles"> | number | null
    profile_pic_url?: StringNullableWithAggregatesFilter<"instagram_profiles"> | string | null
    updated_at?: DateTimeNullableWithAggregatesFilter<"instagram_profiles"> | Date | string | null
  }

  export type sync_stateWhereInput = {
    AND?: sync_stateWhereInput | sync_stateWhereInput[]
    OR?: sync_stateWhereInput[]
    NOT?: sync_stateWhereInput | sync_stateWhereInput[]
    state_key?: StringFilter<"sync_state"> | string
    state_value?: StringFilter<"sync_state"> | string
    updated_at?: DateTimeFilter<"sync_state"> | Date | string
  }

  export type sync_stateOrderByWithRelationInput = {
    state_key?: SortOrder
    state_value?: SortOrder
    updated_at?: SortOrder
  }

  export type sync_stateWhereUniqueInput = Prisma.AtLeast<{
    state_key?: string
    AND?: sync_stateWhereInput | sync_stateWhereInput[]
    OR?: sync_stateWhereInput[]
    NOT?: sync_stateWhereInput | sync_stateWhereInput[]
    state_value?: StringFilter<"sync_state"> | string
    updated_at?: DateTimeFilter<"sync_state"> | Date | string
  }, "state_key">

  export type sync_stateOrderByWithAggregationInput = {
    state_key?: SortOrder
    state_value?: SortOrder
    updated_at?: SortOrder
    _count?: sync_stateCountOrderByAggregateInput
    _max?: sync_stateMaxOrderByAggregateInput
    _min?: sync_stateMinOrderByAggregateInput
  }

  export type sync_stateScalarWhereWithAggregatesInput = {
    AND?: sync_stateScalarWhereWithAggregatesInput | sync_stateScalarWhereWithAggregatesInput[]
    OR?: sync_stateScalarWhereWithAggregatesInput[]
    NOT?: sync_stateScalarWhereWithAggregatesInput | sync_stateScalarWhereWithAggregatesInput[]
    state_key?: StringWithAggregatesFilter<"sync_state"> | string
    state_value?: StringWithAggregatesFilter<"sync_state"> | string
    updated_at?: DateTimeWithAggregatesFilter<"sync_state"> | Date | string
  }

  export type influencerCreateInput = {
    username: string
    accountId?: bigint | number | null
    email?: string | null
    name?: string | null
    bio?: string | null
    followers?: bigint | number | null
    ageGroup?: string | null
    profileLink?: string | null
    categories?: string | null
    hasLinks?: boolean | null
    uploadFreq?: string | null
    recentAvgViews?: bigint | number | null
    captureLinks?: string | null
    pinnedAvgViews?: bigint | number | null
    recent18AvgViews?: bigint | number | null
    recentAds?: string | null
    contactMethod?: string | null
    updated_at?: Date | string | null
    platform?: string
    priority_score?: number | null
    priority_tier?: string | null
    track_history?: boolean | null
    update_interval_minutes?: number | null
  }

  export type influencerUncheckedCreateInput = {
    username: string
    accountId?: bigint | number | null
    email?: string | null
    name?: string | null
    bio?: string | null
    followers?: bigint | number | null
    ageGroup?: string | null
    profileLink?: string | null
    categories?: string | null
    hasLinks?: boolean | null
    uploadFreq?: string | null
    recentAvgViews?: bigint | number | null
    captureLinks?: string | null
    pinnedAvgViews?: bigint | number | null
    recent18AvgViews?: bigint | number | null
    recentAds?: string | null
    contactMethod?: string | null
    updated_at?: Date | string | null
    platform?: string
    priority_score?: number | null
    priority_tier?: string | null
    track_history?: boolean | null
    update_interval_minutes?: number | null
  }

  export type influencerUpdateInput = {
    username?: StringFieldUpdateOperationsInput | string
    accountId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    followers?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    ageGroup?: NullableStringFieldUpdateOperationsInput | string | null
    profileLink?: NullableStringFieldUpdateOperationsInput | string | null
    categories?: NullableStringFieldUpdateOperationsInput | string | null
    hasLinks?: NullableBoolFieldUpdateOperationsInput | boolean | null
    uploadFreq?: NullableStringFieldUpdateOperationsInput | string | null
    recentAvgViews?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    captureLinks?: NullableStringFieldUpdateOperationsInput | string | null
    pinnedAvgViews?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    recent18AvgViews?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    recentAds?: NullableStringFieldUpdateOperationsInput | string | null
    contactMethod?: NullableStringFieldUpdateOperationsInput | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    platform?: StringFieldUpdateOperationsInput | string
    priority_score?: NullableIntFieldUpdateOperationsInput | number | null
    priority_tier?: NullableStringFieldUpdateOperationsInput | string | null
    track_history?: NullableBoolFieldUpdateOperationsInput | boolean | null
    update_interval_minutes?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type influencerUncheckedUpdateInput = {
    username?: StringFieldUpdateOperationsInput | string
    accountId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    followers?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    ageGroup?: NullableStringFieldUpdateOperationsInput | string | null
    profileLink?: NullableStringFieldUpdateOperationsInput | string | null
    categories?: NullableStringFieldUpdateOperationsInput | string | null
    hasLinks?: NullableBoolFieldUpdateOperationsInput | boolean | null
    uploadFreq?: NullableStringFieldUpdateOperationsInput | string | null
    recentAvgViews?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    captureLinks?: NullableStringFieldUpdateOperationsInput | string | null
    pinnedAvgViews?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    recent18AvgViews?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    recentAds?: NullableStringFieldUpdateOperationsInput | string | null
    contactMethod?: NullableStringFieldUpdateOperationsInput | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    platform?: StringFieldUpdateOperationsInput | string
    priority_score?: NullableIntFieldUpdateOperationsInput | number | null
    priority_tier?: NullableStringFieldUpdateOperationsInput | string | null
    track_history?: NullableBoolFieldUpdateOperationsInput | boolean | null
    update_interval_minutes?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type influencerCreateManyInput = {
    username: string
    accountId?: bigint | number | null
    email?: string | null
    name?: string | null
    bio?: string | null
    followers?: bigint | number | null
    ageGroup?: string | null
    profileLink?: string | null
    categories?: string | null
    hasLinks?: boolean | null
    uploadFreq?: string | null
    recentAvgViews?: bigint | number | null
    captureLinks?: string | null
    pinnedAvgViews?: bigint | number | null
    recent18AvgViews?: bigint | number | null
    recentAds?: string | null
    contactMethod?: string | null
    updated_at?: Date | string | null
    platform?: string
    priority_score?: number | null
    priority_tier?: string | null
    track_history?: boolean | null
    update_interval_minutes?: number | null
  }

  export type influencerUpdateManyMutationInput = {
    username?: StringFieldUpdateOperationsInput | string
    accountId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    followers?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    ageGroup?: NullableStringFieldUpdateOperationsInput | string | null
    profileLink?: NullableStringFieldUpdateOperationsInput | string | null
    categories?: NullableStringFieldUpdateOperationsInput | string | null
    hasLinks?: NullableBoolFieldUpdateOperationsInput | boolean | null
    uploadFreq?: NullableStringFieldUpdateOperationsInput | string | null
    recentAvgViews?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    captureLinks?: NullableStringFieldUpdateOperationsInput | string | null
    pinnedAvgViews?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    recent18AvgViews?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    recentAds?: NullableStringFieldUpdateOperationsInput | string | null
    contactMethod?: NullableStringFieldUpdateOperationsInput | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    platform?: StringFieldUpdateOperationsInput | string
    priority_score?: NullableIntFieldUpdateOperationsInput | number | null
    priority_tier?: NullableStringFieldUpdateOperationsInput | string | null
    track_history?: NullableBoolFieldUpdateOperationsInput | boolean | null
    update_interval_minutes?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type influencerUncheckedUpdateManyInput = {
    username?: StringFieldUpdateOperationsInput | string
    accountId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    name?: NullableStringFieldUpdateOperationsInput | string | null
    bio?: NullableStringFieldUpdateOperationsInput | string | null
    followers?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    ageGroup?: NullableStringFieldUpdateOperationsInput | string | null
    profileLink?: NullableStringFieldUpdateOperationsInput | string | null
    categories?: NullableStringFieldUpdateOperationsInput | string | null
    hasLinks?: NullableBoolFieldUpdateOperationsInput | boolean | null
    uploadFreq?: NullableStringFieldUpdateOperationsInput | string | null
    recentAvgViews?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    captureLinks?: NullableStringFieldUpdateOperationsInput | string | null
    pinnedAvgViews?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    recent18AvgViews?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    recentAds?: NullableStringFieldUpdateOperationsInput | string | null
    contactMethod?: NullableStringFieldUpdateOperationsInput | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    platform?: StringFieldUpdateOperationsInput | string
    priority_score?: NullableIntFieldUpdateOperationsInput | number | null
    priority_tier?: NullableStringFieldUpdateOperationsInput | string | null
    track_history?: NullableBoolFieldUpdateOperationsInput | boolean | null
    update_interval_minutes?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type instagram_keyword_cacheCreateInput = {
    id?: bigint | number
    categories?: string | null
    keywords?: string | null
    prompt_version: string
    updated_at?: Date | string | null
    username: string
  }

  export type instagram_keyword_cacheUncheckedCreateInput = {
    id?: bigint | number
    categories?: string | null
    keywords?: string | null
    prompt_version: string
    updated_at?: Date | string | null
    username: string
  }

  export type instagram_keyword_cacheUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    categories?: NullableStringFieldUpdateOperationsInput | string | null
    keywords?: NullableStringFieldUpdateOperationsInput | string | null
    prompt_version?: StringFieldUpdateOperationsInput | string
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    username?: StringFieldUpdateOperationsInput | string
  }

  export type instagram_keyword_cacheUncheckedUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    categories?: NullableStringFieldUpdateOperationsInput | string | null
    keywords?: NullableStringFieldUpdateOperationsInput | string | null
    prompt_version?: StringFieldUpdateOperationsInput | string
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    username?: StringFieldUpdateOperationsInput | string
  }

  export type instagram_keyword_cacheCreateManyInput = {
    id?: bigint | number
    categories?: string | null
    keywords?: string | null
    prompt_version: string
    updated_at?: Date | string | null
    username: string
  }

  export type instagram_keyword_cacheUpdateManyMutationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    categories?: NullableStringFieldUpdateOperationsInput | string | null
    keywords?: NullableStringFieldUpdateOperationsInput | string | null
    prompt_version?: StringFieldUpdateOperationsInput | string
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    username?: StringFieldUpdateOperationsInput | string
  }

  export type instagram_keyword_cacheUncheckedUpdateManyInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    categories?: NullableStringFieldUpdateOperationsInput | string | null
    keywords?: NullableStringFieldUpdateOperationsInput | string | null
    prompt_version?: StringFieldUpdateOperationsInput | string
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    username?: StringFieldUpdateOperationsInput | string
  }

  export type instagram_postsCreateInput = {
    post_id: string
    caption?: string | null
    comment_count?: number | null
    display_url?: string | null
    is_video?: boolean | null
    like_count?: number | null
    media_type?: string | null
    permalink?: string | null
    shortcode?: string | null
    taken_at?: string | null
    thumbnail_url?: string | null
    updated_at?: Date | string | null
    username: string
    video_view_count?: number | null
  }

  export type instagram_postsUncheckedCreateInput = {
    post_id: string
    caption?: string | null
    comment_count?: number | null
    display_url?: string | null
    is_video?: boolean | null
    like_count?: number | null
    media_type?: string | null
    permalink?: string | null
    shortcode?: string | null
    taken_at?: string | null
    thumbnail_url?: string | null
    updated_at?: Date | string | null
    username: string
    video_view_count?: number | null
  }

  export type instagram_postsUpdateInput = {
    post_id?: StringFieldUpdateOperationsInput | string
    caption?: NullableStringFieldUpdateOperationsInput | string | null
    comment_count?: NullableIntFieldUpdateOperationsInput | number | null
    display_url?: NullableStringFieldUpdateOperationsInput | string | null
    is_video?: NullableBoolFieldUpdateOperationsInput | boolean | null
    like_count?: NullableIntFieldUpdateOperationsInput | number | null
    media_type?: NullableStringFieldUpdateOperationsInput | string | null
    permalink?: NullableStringFieldUpdateOperationsInput | string | null
    shortcode?: NullableStringFieldUpdateOperationsInput | string | null
    taken_at?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnail_url?: NullableStringFieldUpdateOperationsInput | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    username?: StringFieldUpdateOperationsInput | string
    video_view_count?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type instagram_postsUncheckedUpdateInput = {
    post_id?: StringFieldUpdateOperationsInput | string
    caption?: NullableStringFieldUpdateOperationsInput | string | null
    comment_count?: NullableIntFieldUpdateOperationsInput | number | null
    display_url?: NullableStringFieldUpdateOperationsInput | string | null
    is_video?: NullableBoolFieldUpdateOperationsInput | boolean | null
    like_count?: NullableIntFieldUpdateOperationsInput | number | null
    media_type?: NullableStringFieldUpdateOperationsInput | string | null
    permalink?: NullableStringFieldUpdateOperationsInput | string | null
    shortcode?: NullableStringFieldUpdateOperationsInput | string | null
    taken_at?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnail_url?: NullableStringFieldUpdateOperationsInput | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    username?: StringFieldUpdateOperationsInput | string
    video_view_count?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type instagram_postsCreateManyInput = {
    post_id: string
    caption?: string | null
    comment_count?: number | null
    display_url?: string | null
    is_video?: boolean | null
    like_count?: number | null
    media_type?: string | null
    permalink?: string | null
    shortcode?: string | null
    taken_at?: string | null
    thumbnail_url?: string | null
    updated_at?: Date | string | null
    username: string
    video_view_count?: number | null
  }

  export type instagram_postsUpdateManyMutationInput = {
    post_id?: StringFieldUpdateOperationsInput | string
    caption?: NullableStringFieldUpdateOperationsInput | string | null
    comment_count?: NullableIntFieldUpdateOperationsInput | number | null
    display_url?: NullableStringFieldUpdateOperationsInput | string | null
    is_video?: NullableBoolFieldUpdateOperationsInput | boolean | null
    like_count?: NullableIntFieldUpdateOperationsInput | number | null
    media_type?: NullableStringFieldUpdateOperationsInput | string | null
    permalink?: NullableStringFieldUpdateOperationsInput | string | null
    shortcode?: NullableStringFieldUpdateOperationsInput | string | null
    taken_at?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnail_url?: NullableStringFieldUpdateOperationsInput | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    username?: StringFieldUpdateOperationsInput | string
    video_view_count?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type instagram_postsUncheckedUpdateManyInput = {
    post_id?: StringFieldUpdateOperationsInput | string
    caption?: NullableStringFieldUpdateOperationsInput | string | null
    comment_count?: NullableIntFieldUpdateOperationsInput | number | null
    display_url?: NullableStringFieldUpdateOperationsInput | string | null
    is_video?: NullableBoolFieldUpdateOperationsInput | boolean | null
    like_count?: NullableIntFieldUpdateOperationsInput | number | null
    media_type?: NullableStringFieldUpdateOperationsInput | string | null
    permalink?: NullableStringFieldUpdateOperationsInput | string | null
    shortcode?: NullableStringFieldUpdateOperationsInput | string | null
    taken_at?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnail_url?: NullableStringFieldUpdateOperationsInput | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    username?: StringFieldUpdateOperationsInput | string
    video_view_count?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type instagram_profilesCreateInput = {
    username: string
    biography?: string | null
    category_name?: string | null
    external_url?: string | null
    followers?: number | null
    following?: number | null
    full_name?: string | null
    is_private?: boolean | null
    is_verified?: boolean | null
    media_count?: number | null
    profile_pic_url?: string | null
    updated_at?: Date | string | null
  }

  export type instagram_profilesUncheckedCreateInput = {
    username: string
    biography?: string | null
    category_name?: string | null
    external_url?: string | null
    followers?: number | null
    following?: number | null
    full_name?: string | null
    is_private?: boolean | null
    is_verified?: boolean | null
    media_count?: number | null
    profile_pic_url?: string | null
    updated_at?: Date | string | null
  }

  export type instagram_profilesUpdateInput = {
    username?: StringFieldUpdateOperationsInput | string
    biography?: NullableStringFieldUpdateOperationsInput | string | null
    category_name?: NullableStringFieldUpdateOperationsInput | string | null
    external_url?: NullableStringFieldUpdateOperationsInput | string | null
    followers?: NullableIntFieldUpdateOperationsInput | number | null
    following?: NullableIntFieldUpdateOperationsInput | number | null
    full_name?: NullableStringFieldUpdateOperationsInput | string | null
    is_private?: NullableBoolFieldUpdateOperationsInput | boolean | null
    is_verified?: NullableBoolFieldUpdateOperationsInput | boolean | null
    media_count?: NullableIntFieldUpdateOperationsInput | number | null
    profile_pic_url?: NullableStringFieldUpdateOperationsInput | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type instagram_profilesUncheckedUpdateInput = {
    username?: StringFieldUpdateOperationsInput | string
    biography?: NullableStringFieldUpdateOperationsInput | string | null
    category_name?: NullableStringFieldUpdateOperationsInput | string | null
    external_url?: NullableStringFieldUpdateOperationsInput | string | null
    followers?: NullableIntFieldUpdateOperationsInput | number | null
    following?: NullableIntFieldUpdateOperationsInput | number | null
    full_name?: NullableStringFieldUpdateOperationsInput | string | null
    is_private?: NullableBoolFieldUpdateOperationsInput | boolean | null
    is_verified?: NullableBoolFieldUpdateOperationsInput | boolean | null
    media_count?: NullableIntFieldUpdateOperationsInput | number | null
    profile_pic_url?: NullableStringFieldUpdateOperationsInput | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type instagram_profilesCreateManyInput = {
    username: string
    biography?: string | null
    category_name?: string | null
    external_url?: string | null
    followers?: number | null
    following?: number | null
    full_name?: string | null
    is_private?: boolean | null
    is_verified?: boolean | null
    media_count?: number | null
    profile_pic_url?: string | null
    updated_at?: Date | string | null
  }

  export type instagram_profilesUpdateManyMutationInput = {
    username?: StringFieldUpdateOperationsInput | string
    biography?: NullableStringFieldUpdateOperationsInput | string | null
    category_name?: NullableStringFieldUpdateOperationsInput | string | null
    external_url?: NullableStringFieldUpdateOperationsInput | string | null
    followers?: NullableIntFieldUpdateOperationsInput | number | null
    following?: NullableIntFieldUpdateOperationsInput | number | null
    full_name?: NullableStringFieldUpdateOperationsInput | string | null
    is_private?: NullableBoolFieldUpdateOperationsInput | boolean | null
    is_verified?: NullableBoolFieldUpdateOperationsInput | boolean | null
    media_count?: NullableIntFieldUpdateOperationsInput | number | null
    profile_pic_url?: NullableStringFieldUpdateOperationsInput | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type instagram_profilesUncheckedUpdateManyInput = {
    username?: StringFieldUpdateOperationsInput | string
    biography?: NullableStringFieldUpdateOperationsInput | string | null
    category_name?: NullableStringFieldUpdateOperationsInput | string | null
    external_url?: NullableStringFieldUpdateOperationsInput | string | null
    followers?: NullableIntFieldUpdateOperationsInput | number | null
    following?: NullableIntFieldUpdateOperationsInput | number | null
    full_name?: NullableStringFieldUpdateOperationsInput | string | null
    is_private?: NullableBoolFieldUpdateOperationsInput | boolean | null
    is_verified?: NullableBoolFieldUpdateOperationsInput | boolean | null
    media_count?: NullableIntFieldUpdateOperationsInput | number | null
    profile_pic_url?: NullableStringFieldUpdateOperationsInput | string | null
    updated_at?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type sync_stateCreateInput = {
    state_key: string
    state_value: string
    updated_at?: Date | string
  }

  export type sync_stateUncheckedCreateInput = {
    state_key: string
    state_value: string
    updated_at?: Date | string
  }

  export type sync_stateUpdateInput = {
    state_key?: StringFieldUpdateOperationsInput | string
    state_value?: StringFieldUpdateOperationsInput | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type sync_stateUncheckedUpdateInput = {
    state_key?: StringFieldUpdateOperationsInput | string
    state_value?: StringFieldUpdateOperationsInput | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type sync_stateCreateManyInput = {
    state_key: string
    state_value: string
    updated_at?: Date | string
  }

  export type sync_stateUpdateManyMutationInput = {
    state_key?: StringFieldUpdateOperationsInput | string
    state_value?: StringFieldUpdateOperationsInput | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type sync_stateUncheckedUpdateManyInput = {
    state_key?: StringFieldUpdateOperationsInput | string
    state_value?: StringFieldUpdateOperationsInput | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type BigIntNullableFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableFilter<$PrismaModel> | bigint | number | null
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type BoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type influencerPlatformUsernameCompoundUniqueInput = {
    platform: string
    username: string
  }

  export type influencerCountOrderByAggregateInput = {
    username?: SortOrder
    accountId?: SortOrder
    email?: SortOrder
    name?: SortOrder
    bio?: SortOrder
    followers?: SortOrder
    ageGroup?: SortOrder
    profileLink?: SortOrder
    categories?: SortOrder
    hasLinks?: SortOrder
    uploadFreq?: SortOrder
    recentAvgViews?: SortOrder
    captureLinks?: SortOrder
    pinnedAvgViews?: SortOrder
    recent18AvgViews?: SortOrder
    recentAds?: SortOrder
    contactMethod?: SortOrder
    updated_at?: SortOrder
    platform?: SortOrder
    priority_score?: SortOrder
    priority_tier?: SortOrder
    track_history?: SortOrder
    update_interval_minutes?: SortOrder
  }

  export type influencerAvgOrderByAggregateInput = {
    accountId?: SortOrder
    followers?: SortOrder
    recentAvgViews?: SortOrder
    pinnedAvgViews?: SortOrder
    recent18AvgViews?: SortOrder
    priority_score?: SortOrder
    update_interval_minutes?: SortOrder
  }

  export type influencerMaxOrderByAggregateInput = {
    username?: SortOrder
    accountId?: SortOrder
    email?: SortOrder
    name?: SortOrder
    bio?: SortOrder
    followers?: SortOrder
    ageGroup?: SortOrder
    profileLink?: SortOrder
    categories?: SortOrder
    hasLinks?: SortOrder
    uploadFreq?: SortOrder
    recentAvgViews?: SortOrder
    captureLinks?: SortOrder
    pinnedAvgViews?: SortOrder
    recent18AvgViews?: SortOrder
    recentAds?: SortOrder
    contactMethod?: SortOrder
    updated_at?: SortOrder
    platform?: SortOrder
    priority_score?: SortOrder
    priority_tier?: SortOrder
    track_history?: SortOrder
    update_interval_minutes?: SortOrder
  }

  export type influencerMinOrderByAggregateInput = {
    username?: SortOrder
    accountId?: SortOrder
    email?: SortOrder
    name?: SortOrder
    bio?: SortOrder
    followers?: SortOrder
    ageGroup?: SortOrder
    profileLink?: SortOrder
    categories?: SortOrder
    hasLinks?: SortOrder
    uploadFreq?: SortOrder
    recentAvgViews?: SortOrder
    captureLinks?: SortOrder
    pinnedAvgViews?: SortOrder
    recent18AvgViews?: SortOrder
    recentAds?: SortOrder
    contactMethod?: SortOrder
    updated_at?: SortOrder
    platform?: SortOrder
    priority_score?: SortOrder
    priority_tier?: SortOrder
    track_history?: SortOrder
    update_interval_minutes?: SortOrder
  }

  export type influencerSumOrderByAggregateInput = {
    accountId?: SortOrder
    followers?: SortOrder
    recentAvgViews?: SortOrder
    pinnedAvgViews?: SortOrder
    recent18AvgViews?: SortOrder
    priority_score?: SortOrder
    update_interval_minutes?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type BigIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableWithAggregatesFilter<$PrismaModel> | bigint | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedBigIntNullableFilter<$PrismaModel>
    _min?: NestedBigIntNullableFilter<$PrismaModel>
    _max?: NestedBigIntNullableFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type BoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type BigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type instagram_keyword_cacheUsernamePrompt_versionCompoundUniqueInput = {
    username: string
    prompt_version: string
  }

  export type instagram_keyword_cacheCountOrderByAggregateInput = {
    id?: SortOrder
    categories?: SortOrder
    keywords?: SortOrder
    prompt_version?: SortOrder
    updated_at?: SortOrder
    username?: SortOrder
  }

  export type instagram_keyword_cacheAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type instagram_keyword_cacheMaxOrderByAggregateInput = {
    id?: SortOrder
    categories?: SortOrder
    keywords?: SortOrder
    prompt_version?: SortOrder
    updated_at?: SortOrder
    username?: SortOrder
  }

  export type instagram_keyword_cacheMinOrderByAggregateInput = {
    id?: SortOrder
    categories?: SortOrder
    keywords?: SortOrder
    prompt_version?: SortOrder
    updated_at?: SortOrder
    username?: SortOrder
  }

  export type instagram_keyword_cacheSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type BigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }

  export type instagram_postsCountOrderByAggregateInput = {
    post_id?: SortOrder
    caption?: SortOrder
    comment_count?: SortOrder
    display_url?: SortOrder
    is_video?: SortOrder
    like_count?: SortOrder
    media_type?: SortOrder
    permalink?: SortOrder
    shortcode?: SortOrder
    taken_at?: SortOrder
    thumbnail_url?: SortOrder
    updated_at?: SortOrder
    username?: SortOrder
    video_view_count?: SortOrder
  }

  export type instagram_postsAvgOrderByAggregateInput = {
    comment_count?: SortOrder
    like_count?: SortOrder
    video_view_count?: SortOrder
  }

  export type instagram_postsMaxOrderByAggregateInput = {
    post_id?: SortOrder
    caption?: SortOrder
    comment_count?: SortOrder
    display_url?: SortOrder
    is_video?: SortOrder
    like_count?: SortOrder
    media_type?: SortOrder
    permalink?: SortOrder
    shortcode?: SortOrder
    taken_at?: SortOrder
    thumbnail_url?: SortOrder
    updated_at?: SortOrder
    username?: SortOrder
    video_view_count?: SortOrder
  }

  export type instagram_postsMinOrderByAggregateInput = {
    post_id?: SortOrder
    caption?: SortOrder
    comment_count?: SortOrder
    display_url?: SortOrder
    is_video?: SortOrder
    like_count?: SortOrder
    media_type?: SortOrder
    permalink?: SortOrder
    shortcode?: SortOrder
    taken_at?: SortOrder
    thumbnail_url?: SortOrder
    updated_at?: SortOrder
    username?: SortOrder
    video_view_count?: SortOrder
  }

  export type instagram_postsSumOrderByAggregateInput = {
    comment_count?: SortOrder
    like_count?: SortOrder
    video_view_count?: SortOrder
  }

  export type instagram_profilesCountOrderByAggregateInput = {
    username?: SortOrder
    biography?: SortOrder
    category_name?: SortOrder
    external_url?: SortOrder
    followers?: SortOrder
    following?: SortOrder
    full_name?: SortOrder
    is_private?: SortOrder
    is_verified?: SortOrder
    media_count?: SortOrder
    profile_pic_url?: SortOrder
    updated_at?: SortOrder
  }

  export type instagram_profilesAvgOrderByAggregateInput = {
    followers?: SortOrder
    following?: SortOrder
    media_count?: SortOrder
  }

  export type instagram_profilesMaxOrderByAggregateInput = {
    username?: SortOrder
    biography?: SortOrder
    category_name?: SortOrder
    external_url?: SortOrder
    followers?: SortOrder
    following?: SortOrder
    full_name?: SortOrder
    is_private?: SortOrder
    is_verified?: SortOrder
    media_count?: SortOrder
    profile_pic_url?: SortOrder
    updated_at?: SortOrder
  }

  export type instagram_profilesMinOrderByAggregateInput = {
    username?: SortOrder
    biography?: SortOrder
    category_name?: SortOrder
    external_url?: SortOrder
    followers?: SortOrder
    following?: SortOrder
    full_name?: SortOrder
    is_private?: SortOrder
    is_verified?: SortOrder
    media_count?: SortOrder
    profile_pic_url?: SortOrder
    updated_at?: SortOrder
  }

  export type instagram_profilesSumOrderByAggregateInput = {
    followers?: SortOrder
    following?: SortOrder
    media_count?: SortOrder
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type sync_stateCountOrderByAggregateInput = {
    state_key?: SortOrder
    state_value?: SortOrder
    updated_at?: SortOrder
  }

  export type sync_stateMaxOrderByAggregateInput = {
    state_key?: SortOrder
    state_value?: SortOrder
    updated_at?: SortOrder
  }

  export type sync_stateMinOrderByAggregateInput = {
    state_key?: SortOrder
    state_value?: SortOrder
    updated_at?: SortOrder
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableBigIntFieldUpdateOperationsInput = {
    set?: bigint | number | null
    increment?: bigint | number
    decrement?: bigint | number
    multiply?: bigint | number
    divide?: bigint | number
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableBoolFieldUpdateOperationsInput = {
    set?: boolean | null
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BigIntFieldUpdateOperationsInput = {
    set?: bigint | number
    increment?: bigint | number
    decrement?: bigint | number
    multiply?: bigint | number
    divide?: bigint | number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedBigIntNullableFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableFilter<$PrismaModel> | bigint | number | null
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedBoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedBigIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableWithAggregatesFilter<$PrismaModel> | bigint | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedBigIntNullableFilter<$PrismaModel>
    _min?: NestedBigIntNullableFilter<$PrismaModel>
    _max?: NestedBigIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedBoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedBigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type NestedBigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}