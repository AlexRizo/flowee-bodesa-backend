import { Socket, Server } from 'socket.io';

export const socketController = (socket: Socket, io: Server) => {
  // console.log('Nuevo cliente conectado', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Cliente desconectado', socket.id);
  });

  socket.on('join-board', (boardSlug: string) => {
    // console.log(`El usuario ${socket.id} se ha unido al tablero ${boardSlug}`);
    socket.join(boardSlug);
  });

  socket.on('new-request', (boardSlug: string) => {
    socket.to(boardSlug).emit('request-created');
  });

  socket.on('join-notifications', (userId: string) => {
    console.log(`El usuario ${userId} se ha unido a las notificaciones`);
    socket.join(userId);
  });

  socket.on('update-request-status', (request: { id: string, boardSlug: string, status: string }) => {
    socket.to(request.boardSlug).emit('request-status-updated', { id: request.id, status: request.status });
    socket.emit('request-status-updated', { id: request.id, status: request.status });
  });
  
  socket.on('touch-notification', (userId: string) => {
    console.log(`El usuario ${userId} ha tocado una notificación`);
    io.to(userId).emit('new-notification', 'Hola Mundooooooooooooooo');
  });
}
