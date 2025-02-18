import {Server, Socket} from "socket.io";

export class WsService {
  private static instances = 0;
  private instanceId: number;
  private disconnectHandlers: Map<string, Function> = new Map();
  private readonly DEFAULT_MAX_LISTENERS = 10;
  private readonly LISTENER_INCREMENT = 5;

  constructor(private readonly server: Server) {
    WsService.instances++;
    this.instanceId = WsService.instances;
    
    if (!server) {
      console.error('[WS] Server instance is required');
      throw new Error('Server instance is required');
    }
    console.log(`[WS-${this.instanceId}] Service initialized with server:`, {
      hasServer: !!server,
      namespace: server?._nsps?.size,
      adapter: !!server?.adapter,
    });
  }

  private logWithId(message: string) {
    console.log(`[WS-${this.instanceId}] ${message}`);
  }

  public getSocketById(id: string): Socket {
    this.logWithId(`Getting socket by ID: ${id}`);
    const global = this.server.of("/");
    const socket = global.sockets.get(id);
    this.logWithId(`Socket found: ${!!socket}`);
    return socket;
  }

  public getSocketsByUserId(id: string, options?: {room: string}): Socket[] {
    this.logWithId(`Getting sockets for user: ${id}, room: ${options?.room || 'none'}`);
    const global = this.server.of("/");
    let sockets = Array.from(global.sockets.values());
    this.logWithId(`Total sockets found: ${sockets.length}`);

    const room = options && options.room;
    if (room) {
      const iterable = global.adapter.rooms.get(room);
      if (iterable) {
        const ids = Array.from(iterable);
        this.logWithId(`Room ${room} has ${ids.length} sockets`);
        sockets = ids.map((id) => this.server.of("/").sockets.get(id));
      }
    }

    const filteredSockets = sockets.filter((socket) => {
      const hasUser = !!socket?.request?.session?.user;
      const isMatchingUser = socket?.request?.session?.user?.id === id;
      this.logWithId(`Socket check - Has user: ${hasUser}, Matching user: ${isMatchingUser}`);
      return isMatchingUser;
    });

    this.logWithId(`Found ${filteredSockets.length} sockets for user ${id}`);
    return filteredSockets;
  }

  private cleanupOldHandlers(socket: Socket, userId: string) {
    this.logWithId(`Starting cleanup for user ${userId} on socket ${socket.id}`);
    this.logWithId(`Current handlers before cleanup: ${this.disconnectHandlers.size}`);
    
    // 获取当前 socket 的所有监听器
    const currentListeners = socket.listeners('disconnect');
    this.logWithId(`Current disconnect listeners count: ${currentListeners.length}`);
    
    // 清理同一个 socket 上的所有旧处理器
    const handlersToRemove = Array.from(this.disconnectHandlers.entries())
      .filter(([key]) => key.startsWith(`${userId}:${socket.id}:`));
    
    this.logWithId(`Found ${handlersToRemove.length} handlers to remove for socket ${socket.id}`);
    
    handlersToRemove.forEach(([key, handler]) => {
      this.logWithId(`Cleaning up handler: ${key}`);
      socket.removeListener('disconnect', handler as any);
      this.disconnectHandlers.delete(key);
    });

    const remainingListeners = socket.listeners('disconnect');
    this.logWithId(`Remaining disconnect listeners after cleanup: ${remainingListeners.length}`);
    this.logWithId(`Handlers remaining after cleanup: ${this.disconnectHandlers.size}`);
  }

  public setupDisconnectHandler(
    socket: Socket,
    userId: string,
    handler: () => void,
    context: string
  ) {
    this.logWithId(`Setting up handler for user ${userId} in context ${context}`);
    this.logWithId(`Socket ID: ${socket.id}`);

    if (!socket || !userId || !handler || !context) {
      console.error(`[WS-${this.instanceId}] Invalid parameters for setupDisconnectHandler`);
      return;
    }

    // 生成唯一的处理器标识
    const handlerId = `${userId}:${socket.id}:${context}`;
    this.logWithId(`Generated handler ID: ${handlerId}`);
    
    // 获取当前监听器数量并详细记录
    const currentListeners = socket.listeners('disconnect');
    this.logWithId(`[LISTENERS] Current disconnect listeners before setup: ${currentListeners.length}`);
    this.logWithId(`[LISTENERS] Current max listeners setting: ${socket.getMaxListeners()}`);
    
    // 记录所有现有的监听器信息
    currentListeners.forEach((listener, index) => {
      this.logWithId(`[LISTENERS] Existing listener ${index + 1}: ${listener.name || 'anonymous'}`);
    });
    
    // 清理同一个 socket 上的旧处理器
    this.cleanupOldHandlers(socket, userId);
    
    // 如果已存在处理器，先移除
    if (this.disconnectHandlers.has(handlerId)) {
      this.logWithId(`[HANDLERS] Removing existing handler for ${handlerId}`);
      const oldHandler = this.disconnectHandlers.get(handlerId);
      socket.removeListener('disconnect', oldHandler as any);
      this.disconnectHandlers.delete(handlerId);
    }

    // 创建新的处理器
    const disconnectHandler = () => {
      this.logWithId(`[EXECUTION] Executing handler for ${handlerId}`);
      this.logWithId(`[HANDLERS] Total handlers before execution: ${this.disconnectHandlers.size}`);
      try {
        handler();
      } catch (error) {
        console.error(`[WS-${this.instanceId}] Error in disconnect handler for ${handlerId}:`, error);
      } finally {
        this.disconnectHandlers.delete(handlerId);
        this.logWithId(`[HANDLERS] Handler removed, remaining handlers: ${this.disconnectHandlers.size}`);
        
        // 检查剩余的监听器
        const remainingListeners = socket.listeners('disconnect');
        this.logWithId(`[LISTENERS] Remaining disconnect listeners after execution: ${remainingListeners.length}`);
      }
    };

    // 存储并设置新处理器
    this.disconnectHandlers.set(handlerId, disconnectHandler);
    socket.on('disconnect', disconnectHandler);
    
    // 检查设置后的监听器
    const listenersAfterSetup = socket.listeners('disconnect');
    this.logWithId(`[LISTENERS] Disconnect listeners after setup: ${listenersAfterSetup.length}`);
    this.logWithId(`[HANDLERS] Total handlers after setup: ${this.disconnectHandlers.size}`);

    // 设置最大监听器数量
    const currentMaxListeners = socket.getMaxListeners();
    const requiredListeners = Math.max(
      this.DEFAULT_MAX_LISTENERS,
      listenersAfterSetup.length + this.LISTENER_INCREMENT
    );
    
    this.logWithId(`[LIMITS] Current max listeners: ${currentMaxListeners}`);
    this.logWithId(`[LIMITS] Required listeners: ${requiredListeners}`);
    
    if (currentMaxListeners < requiredListeners) {
      this.logWithId(`[LIMITS] Increasing max listeners from ${currentMaxListeners} to ${requiredListeners}`);
      socket.setMaxListeners(requiredListeners);
      this.logWithId(`[LIMITS] New max listeners setting: ${socket.getMaxListeners()}`);
    } else {
      this.logWithId(`[LIMITS] No need to increase max listeners. Current: ${currentMaxListeners}, Required: ${requiredListeners}`);
    }

    // 打印所有当前的处理器
    this.logWithId('[HANDLERS] Current handlers:');
    this.disconnectHandlers.forEach((_, key) => {
      this.logWithId(`[HANDLERS] - ${key}`);
    });

    // 最终状态检查
    this.logWithId(`[FINAL] Socket ${socket.id} final state:`);
    this.logWithId(`[FINAL] - Total disconnect listeners: ${socket.listeners('disconnect').length}`);
    this.logWithId(`[FINAL] - Max listeners setting: ${socket.getMaxListeners()}`);
    this.logWithId(`[FINAL] - Total tracked handlers: ${this.disconnectHandlers.size}`);
  }

  public removeDisconnectHandler(socket: Socket, userId: string, context: string) {
    this.logWithId(`Manual handler removal requested for user ${userId} in context ${context}`);
    
    if (!socket || !userId || !context) {
      console.error(`[WS-${this.instanceId}] Invalid parameters for removeDisconnectHandler`);
      return;
    }

    const handlerId = `${userId}:${socket.id}:${context}`;
    this.logWithId(`Attempting to remove handler: ${handlerId}`);
    
    const handler = this.disconnectHandlers.get(handlerId);
    if (handler) {
      const beforeListeners = socket.listeners('disconnect').length;
      socket.removeListener('disconnect', handler as any);
      const afterListeners = socket.listeners('disconnect').length;
      
      this.disconnectHandlers.delete(handlerId);
      this.logWithId(`Handler removed successfully`);
      this.logWithId(`Listeners before: ${beforeListeners}, after: ${afterListeners}`);
      this.logWithId(`Remaining handlers: ${this.disconnectHandlers.size}`);
    } else {
      this.logWithId(`No handler found for ID: ${handlerId}`);
    }
  }
}
