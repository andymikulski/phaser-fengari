import * as fengari from 'fengari-web';
export const lua = fengari.lua;
export const lauxlib = fengari.lauxlib;
export const lualib = fengari.lualib;

export type LuaVMState = any;

export default class LuaVM {
  private state: LuaVMState;

  constructor() {
    this.state = lauxlib.luaL_newstate();
    // Load Lua libraries
    lualib.luaL_openlibs(this.state);
  }

  public execute(code: string): void {
    const resultCode = lauxlib.luaL_loadstring(this.state, fengari.to_luastring(code));
    if (resultCode) {
      throw new Error(lua.lua_tojsstring(this.state, -1));
    }
    lua.lua_call(this.state, 0, 0);
  }

  public callFunction(functionName: string, ...args: any[]): any {
    lua.lua_getglobal(this.state, fengari.to_luastring(functionName));

    for (const arg of args) {
      switch (typeof arg) {
        case 'boolean':
          lua.lua_pushboolean(this.state, arg ? 1 : 0);
          break;
        case 'number':
          lua.lua_pushnumber(this.state, arg);
          break;
        case 'string':
          lua.lua_pushstring(this.state, fengari.to_luastring(arg));
          break;
        default:
          throw new Error('Unsupported argument type');
      }
    }

    if (lua.lua_pcall(this.state, args.length, 1, 0) !== 0) {
      throw new Error(lua.lua_tojsstring(this.state, -1));
    }

    const type = lua.lua_type(this.state, -1);
    let returnValue;
    switch (type) {
      case lua.LUA_TNIL:
        returnValue = null;
        break;
      case lua.LUA_TBOOLEAN:
        returnValue = lua.lua_toboolean(this.state, -1);
        break;
      case lua.LUA_TNUMBER:
        returnValue = lua.lua_tonumber(this.state, -1);
        break;
      case lua.LUA_TSTRING:
        returnValue = lua.lua_tojsstring(this.state, -1);
        break;
      default:
        throw new Error('Unsupported return type');
    }

    lua.lua_pop(this.state, 1);  // Pop the returned value from stack
    return returnValue;
  }

  public registerHook(name: string, fn: (...args: any[]) => any): void {
    const luaFn = (luaState: any) => {
      const argCount = lua.lua_gettop(luaState);
      const args = [];

      for (let i = 1; i <= argCount; i++) {
        if (lua.lua_isnumber(luaState, i)) {
          args.push(lua.lua_tonumber(luaState, i));
        } else if (lua.lua_isstring(luaState, i)) {
          args.push(lua.lua_tojsstring(luaState, i));
        } else {
          args.push(null);
        }
      }

      const result = fn(...args);
      if (typeof result === 'number') {
        lua.lua_pushnumber(luaState, result);
        return 1; // Returning 1 result
      } else if (typeof result === 'string') {
        lua.lua_pushstring(luaState, fengari.to_luastring(result));
        return 1; // Returning 1 result
      }

      return 0; // Returning 0 results
    };

    lua.lua_pushjsfunction(this.state, luaFn);
    lua.lua_setglobal(this.state, fengari.to_luastring(name));
  }

  public getGlobal(variableName: string): any {
    lua.lua_getglobal(this.state, fengari.to_luastring(variableName));
    const type = lua.lua_type(this.state, -1);

    let returnValue;
    switch (type) {
      case lua.LUA_TNUMBER:
        returnValue = lua.lua_tonumber(this.state, -1);
        break;
      case lua.LUA_TSTRING:
        returnValue = fengari.lua_tojsstring(this.state, -1);
        break;
      default:
        throw new Error('Unsupported variable type');
    }

    lua.lua_pop(this.state, 1); // Pop the value from stack
    return returnValue;
  }

  public dispose(): void {
    lua.lua_close(this.state);
  }
}
