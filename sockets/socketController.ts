import { Socket } from 'socket.io';

export const socketController = (socket: Socket) => {
  console.log('Nuevo cliente conectado', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Cliente desconectado', socket.id);
  });

  socket.on('join-board', (boardSlug: string) => {
    console.log(`El usuario ${socket.id} se ha unido al tablero ${boardSlug}`);
    socket.join(boardSlug);
  });

  socket.on('update-request-status', (request: { id: string, boardSlug: string, status: string }) => {
    socket.to(request.boardSlug).emit('request-status-updated', { id: request.id, status: request.status });
  })
}
