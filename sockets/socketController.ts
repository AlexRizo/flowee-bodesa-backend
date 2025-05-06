import { Socket, Server } from 'socket.io';

export const socketController = (socket: Socket, io: Server) => {
  socket.on('join-board', (boardSlug: string) => {
    socket.join(boardSlug);
  });

  socket.on('new-request', (boardSlug: string) => {
    socket.to(boardSlug).emit('request-created');
  });

  socket.on('join-notifications', (userId: string) => {
    socket.join(userId);
  });

  socket.on('update-request-status', (request: { id: string, boardSlug: string, status: string }) => {
    socket.to(request.boardSlug).emit('request-status-updated', { id: request.id, status: request.status });
    socket.emit('request-status-updated', { id: request.id, status: request.status });
  });
  
  socket.on('touch-notification', (userId: string) => {
    io.to(userId).emit('new-notification', 'Hola Mundooooooooooooooo');
  });
}
