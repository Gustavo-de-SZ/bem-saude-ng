// import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpResponse } from '@angular/common/http';
// import { of, Observable } from 'rxjs';
// import { delay } from 'rxjs/operators';
// import { Cliente } from '../models/cliente';
// import { Agendamento } from '../models/agendamento';
// import { Servico } from '../models/servico';
// import { Transacao } from '../models/transacao';
// import { Solicitacao } from '../models/solicitacao';

// // Setup Mock Database Initial Seed Data
// const defaultClientes: Cliente[] = [
//   { nome: 'Mariana Costa', empresa: 'Tech Solutions Inc.', avaliacao: 4.8, email: 'mariana@techsolutions.com', telefone: '(11) 98765-4321', local: 'São Paulo - SP', servicosAtivos: 2, servicosConcluidos: 14, tipoCliente: 'Corporate', status: 'Ativo' },
//   { nome: 'Roberto Alencar', empresa: 'Alencar Advocacia', avaliacao: 4.5, email: 'roberto@alencaradv.com', telefone: '(21) 97654-3210', local: 'Rio de Janeiro - RJ', servicosAtivos: 1, servicosConcluidos: 8, tipoCliente: 'PME', status: 'Ativo' },
//   { nome: 'Cláudia Souza', empresa: 'Clínica Bem Estar', avaliacao: 4.9, email: 'claudia@bemestar.com', telefone: '(31) 96543-2109', local: 'Belo Horizonte - MG', servicosAtivos: 0, servicosConcluidos: 5, tipoCliente: 'PME', status: 'Inativo' }
// ];

// const defaultAgendamentos: Agendamento[] = [
//   { id: '1', mes: 'Julho', dia: '16', hora: '09:00', titulo: 'Instalação de Switch L3', empresa: 'Tech Solutions Inc.', servico: 'Redes', cliente: 'mariana@techsolutions.com', status: 'Confirmado', duracao: '2h', tipo: 'Presencial' },
//   { id: '2', mes: 'Julho', dia: '17', hora: '14:30', titulo: 'Configuração de Firewall', empresa: 'Alencar Advocacia', servico: 'Segurança', cliente: 'roberto@alencaradv.com', status: 'Pendente', duracao: '3h', tipo: 'Remoto' },
//   { id: '3', mes: 'Julho', dia: '15', hora: '11:00', titulo: 'Manutenção Preventiva de Servidores', empresa: 'Tech Solutions Inc.', servico: 'Hardware', cliente: 'mariana@techsolutions.com', status: 'Concluído', duracao: '4h', tipo: 'Presencial' }
// ];

// const defaultTransacoes: Transacao[] = [
//   { titulo: 'Configuração de Firewall', cliente: 'Alencar Advocacia', data: '15/07/2026', valor: 850, status: 'Pago' },
//   { titulo: 'Instalação de Switch L3', cliente: 'Tech Solutions Inc.', data: '16/07/2026', valor: 1200, status: 'Pendente' },
//   { titulo: 'Consultoria em LGPD', cliente: 'Clínica Bem Estar', data: '12/07/2026', valor: 2800, status: 'Pago' }
// ];

// const defaultServicos: Servico[] = [
//   { icone: 'pi-wifi', categoria: 'Redes', titulo: 'Instalação de Switch L3', status: 'Pendente', cliente: 'mariana@techsolutions.com', data: '16/07/2026', duracao: '2h', valor: 'R$ 1.200', descricao: 'Configuração completa de switch core com divisão de VLANs e roteamento estático.' },
//   { icone: 'pi-shield', categoria: 'Segurança', titulo: 'Configuração de Firewall', status: 'Pendente', cliente: 'roberto@alencaradv.com', data: '17/07/2026', duracao: '3h', valor: 'R$ 850', descricao: 'Implementação de regras de tráfego de entrada/saída, VPN IPSec e bloqueio de portas vulneráveis.' },
//   { icone: 'pi-server', categoria: 'Hardware', titulo: 'Manutenção Preventiva de Servidores', status: 'Finalizado', cliente: 'mariana@techsolutions.com', data: '15/07/2026', duracao: '4h', valor: 'R$ 1.500', descricao: 'Limpeza física interna, troca de pasta térmica, verificação de integridade dos discos em RAID 5 e atualização de firmware do storage.' }
// ];

// const defaultSolicitacoes: Solicitacao[] = [
//   { id: 1, titulo: 'Internet caindo constantemente', descricao_problema: 'O link dedicado de internet cai em média 3 vezes por hora. O roteador principal mostra perdas de pacote constantes.', categoria_id: 1, dataCriacao: '2026-07-15T10:00:00Z' },
//   { id: 2, titulo: 'Upgrade de memória RAM do servidor de arquivos', descricao_problema: 'O servidor de arquivos local (Dell T340) está com lentidão extrema. Precisamos adicionar mais 32GB de memória RAM DDR4 ECC.', categoria_id: 2, dataCriacao: '2026-07-14T15:30:00Z' }
// ];

// // LocalStorage Helper Helpers
// function getStored<T>(key: string, defaults: T[]): T[] {
//   const data = localStorage.getItem(key);
//   if (!data) {
//     localStorage.setItem(key, JSON.stringify(defaults));
//     return defaults;
//   }
//   try {
//     return JSON.parse(data);
//   } catch {
//     return defaults;
//   }
// }

// function setStored<T>(key: string, data: T[]): void {
//   localStorage.setItem(key, JSON.stringify(data));
// }

// export const mockApiInterceptorFn: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<any> => {
//   const url = req.url;

//   // Only intercept requests directed to our localhost:8000 backend API
//   if (!url.includes('http://localhost:8000/api')) {
//     return next(req);
//   }

//   const path = url.replace('http://localhost:8000/api', '');
//   const method = req.method;

//   console.log(`[Mock API Interceptor] Intercepted: ${method} ${path}`, req.body);

//   // 1. Check Profile existence Verification
//   if (path.startsWith('/usuarios/perfil/verificar')) {
//     const savedUser = localStorage.getItem('tcc_mock_user');
//     let email = '';
//     let type: 'cliente' | 'tecnico' | null = 'tecnico';
//     if (savedUser) {
//       try {
//         const u = JSON.parse(savedUser);
//         email = u.email || '';
//         const roles = u['https://tcc-ng.com/roles'] || [];
//         type = roles[0]?.toLowerCase() === 'cliente' ? 'cliente' : 'tecnico';
//       } catch {}
//     }

//     // Decode from auth token if present
//     const authHeader = req.headers.get('Authorization');
//     if (authHeader && authHeader.startsWith('Bearer ')) {
//       const token = authHeader.substring(7);
//       try {
//         const payloadBase64 = token.split('.')[1];
//         const payloadBase64Padding = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
//         const payload = JSON.parse(atob(payloadBase64Padding));
//         if (payload.email) {
//           email = payload.email;
//         }
//         if (payload['https://tcc-ng.com/roles']) {
//           const roles = payload['https://tcc-ng.com/roles'] || [];
//           type = roles[0]?.toLowerCase() === 'cliente' ? 'cliente' : 'tecnico';
//         }
//       } catch {}
//     }

//     // Check if profile is marked as completed in localStorage
//     // Default to true for standard mock accounts to not break the iframe quick buttons, but allow testing for other accounts if set to 'false'
//     let exists = false;
//     if (email) {
//       if (email === 'tecnico@tcc-ng.com' || email === 'cliente@tcc-ng.com') {
//         exists = localStorage.getItem(`tcc_profile_completed_${email}`) !== 'false';
//       } else {
//         exists = localStorage.getItem(`tcc_profile_completed_${email}`) === 'true';
//       }
//     }

//     return of(new HttpResponse({
//       status: 200,
//       body: { exists: exists, type: type }
//     })).pipe(delay(150));
//   }

//   // 2. Profile Creation for tecnico or cliente
//   if (path.startsWith('/clientes') && method === 'POST' && !path.endsWith('/tecnico')) {
//     const clientes = getStored('tcc_clientes', defaultClientes);
//     const body = req.body as Partial<Cliente>;
//     const email = body.email || 'novo@empresa.com';
//     const index = clientes.findIndex(c => c.email === email);
//     const newCliente: Cliente = {
//       nome: body.nome || 'Novo Cliente',
//       empresa: body.empresa || 'Nova Empresa',
//       avaliacao: 5.0,
//       email: email,
//       telefone: body.telefone || '(00) 00000-0000',
//       local: body.local || 'São Paulo - SP',
//       servicosAtivos: 0,
//       servicosConcluidos: 0,
//       tipoCliente: body.tipoCliente || 'PME',
//       status: body.status || 'Ativo'
//     };
//     if (index !== -1) {
//       clientes[index] = { ...clientes[index], ...newCliente };
//     } else {
//       clientes.push(newCliente);
//     }
//     setStored('tcc_clientes', clientes);
//     return of(new HttpResponse({ status: 201, body: newCliente })).pipe(delay(150));
//   }

//   if (path.startsWith('/tecnicos') && method === 'POST') {
//     return of(new HttpResponse({ status: 201, body: { success: true } })).pipe(delay(150));
//   }

//   // 3. Dashboard Data
//   if (path.startsWith('/dashboard')) {
//     const agendamentos = getStored('tcc_agendamentos', defaultAgendamentos);
//     const body = {
//       stats: [
//         { titulo: 'Ganhos Mensais', valor: 'R$ 4.850', icone: 'pi pi-dollar', cor: '#10b981' },
//         { titulo: 'Chamados Concluídos', valor: '12', icone: 'pi pi-check-circle', cor: '#3b82f6' },
//         { titulo: 'Pendentes', valor: '3', icone: 'pi pi-clock', cor: '#f59e0b' },
//         { titulo: 'Avaliação Média', valor: '4.9', icone: 'pi pi-star-fill', cor: '#fbbf24' }
//       ],
//       agendamentos: agendamentos
//     };
//     return of(new HttpResponse({ status: 200, body })).pipe(delay(200));
//   }

//   // 4. Clients Statistics
//   if (path.startsWith('/clientes/stats')) {
//     const body = [
//       { titulo: 'Total Clientes', valor: '28', icone: 'pi pi-users', cor: '#3b82f6' },
//       { titulo: 'Novos Este Mês', valor: '+4', icone: 'pi pi-user-plus', cor: '#10b981' }
//     ];
//     return of(new HttpResponse({ status: 200, body })).pipe(delay(150));
//   }

//   // 5. Agendamentos Endpoints (GET, POST, PUT, DELETE)
//   if (path.startsWith('/agendamentos')) {
//     const agendamentos = getStored('tcc_agendamentos', defaultAgendamentos);

//     if (method === 'GET') {
//       return of(new HttpResponse({ status: 200, body: agendamentos })).pipe(delay(150));
//     }

//     if (method === 'POST') {
//       const body = req.body as Partial<Agendamento>;
      
//       let diaStr = body.dia || '15';
//       let mesStr = body.mes || 'Julho';

//       // Parse date defensively if it contains full date format
//       if (diaStr.includes('-')) {
//         const partes = diaStr.split('-');
//         if (partes.length === 3) {
//           diaStr = partes[2];
//           const mNum = parseInt(partes[1], 10);
//           const meses = [
//             'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
//             'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
//           ];
//           if (mNum >= 1 && mNum <= 12) {
//             mesStr = meses[mNum - 1];
//           }
//         }
//       }

//       const newAgendamento: Agendamento = {
//         id: Math.random().toString(36).substr(2, 9),
//         mes: mesStr,
//         dia: diaStr,
//         hora: body.hora || '12:00',
//         titulo: body.titulo || 'Novo Suporte',
//         empresa: body.empresa || 'Empresa Cliente',
//         servico: body.servico || 'Suporte',
//         cliente: body.cliente || 'cliente@empresa.com',
//         status: body.status || 'Confirmado',
//         duracao: body.duracao || '1h',
//         tipo: body.tipo || 'Remoto'
//       };
//       agendamentos.push(newAgendamento);
//       setStored('tcc_agendamentos', agendamentos);
//       return of(new HttpResponse({ status: 201, body: newAgendamento })).pipe(delay(150));
//     }

//     if (method === 'PUT') {
//       const id = path.split('/').pop();
//       const body = req.body as Agendamento;
//       const index = agendamentos.findIndex(a => a.id === id);
//       if (index !== -1) {
//         agendamentos[index] = { ...agendamentos[index], ...body };
//         setStored('tcc_agendamentos', agendamentos);
//         return of(new HttpResponse({ status: 200, body: agendamentos[index] })).pipe(delay(150));
//       }
//       return of(new HttpResponse({ status: 404, body: { error: 'Agendamento não encontrado' } })).pipe(delay(150));
//     }

//     if (method === 'DELETE') {
//       const id = path.split('/').pop();
//       const filtered = agendamentos.filter(a => a.id !== id);
//       setStored('tcc_agendamentos', filtered);
//       return of(new HttpResponse({ status: 200, body: {} })).pipe(delay(150));
//     }
//   }

//   // 6. Solicitacoes (GET, POST, PUT, DELETE)
//   if (path.startsWith('/solicitacoes')) {
//     const solicitacoes = getStored('tcc_solicitacoes', defaultSolicitacoes);

//     if (method === 'GET') {
//       return of(new HttpResponse({ status: 200, body: solicitacoes })).pipe(delay(150));
//     }

//     if (method === 'POST') {
//       const body = req.body as Partial<Solicitacao>;
//       const newSolicitacao: Solicitacao = {
//         id: Math.floor(Math.random() * 1000000),
//         titulo: body.titulo || 'Solicitação sem título',
//         descricao_problema: body.descricao_problema || '',
//         categoria_id: body.categoria_id || 1,
//         dataCriacao: new Date().toISOString()
//       };
//       solicitacoes.push(newSolicitacao);
//       setStored('tcc_solicitacoes', solicitacoes);
//       return of(new HttpResponse({ status: 201, body: newSolicitacao })).pipe(delay(150));
//     }

//     if (method === 'PUT') {
//       const id = parseInt(path.split('/').pop() || '0', 10);
//       const body = req.body as Solicitacao;
//       const index = solicitacoes.findIndex(s => s.id === id);
//       if (index !== -1) {
//         solicitacoes[index] = { ...solicitacoes[index], ...body };
//         setStored('tcc_solicitacoes', solicitacoes);
//         return of(new HttpResponse({ status: 200, body: solicitacoes[index] })).pipe(delay(150));
//       }
//       return of(new HttpResponse({ status: 404, body: { error: 'Solicitação não encontrada' } })).pipe(delay(150));
//     }

//     if (method === 'DELETE') {
//       const id = parseInt(path.split('/').pop() || '0', 10);
//       const filtered = solicitacoes.filter(s => s.id !== id);
//       setStored('tcc_solicitacoes', filtered);
//       return of(new HttpResponse({ status: 200, body: {} })).pipe(delay(150));
//     }
//   }

//   // 7. Favoritos e Categorias
//   if (path.startsWith('/profissionais/favoritos')) {
//     const body = [
//       { id: '1', nome: 'Carlos Silva', especialidade: 'Administração de Redes e Servidores', avaliacao: 4.9, foto: 'https://picsum.photos/seed/carlos/150/150', disponivel: true, local: 'São Paulo - SP' },
//       { id: '2', nome: 'Ana Oliveira', especialidade: 'Segurança da Informação e Auditoria', avaliacao: 4.8, foto: 'https://picsum.photos/seed/ana/150/150', disponivel: false, local: 'Rio de Janeiro - RJ' },
//       { id: '3', nome: 'Marcos Souza', especialidade: 'Manutenção de Hardware e Notebooks', avaliacao: 4.7, foto: 'https://picsum.photos/seed/marcos/150/150', disponivel: true, local: 'Belo Horizonte - MG' }
//     ];
//     return of(new HttpResponse({ status: 200, body })).pipe(delay(150));
//   }

//   if (path.startsWith('/categorias')) {
//     const body = ['Redes', 'Hardware', 'Software', 'Segurança', 'Impressoras', 'Outros'];
//     return of(new HttpResponse({ status: 200, body })).pipe(delay(100));
//   }

//   // 8. Transações Financeiras (GET, POST, PUT, DELETE)
//   if (path.startsWith('/transacoes')) {
//     const transacoes = getStored('tcc_transacoes', defaultTransacoes);

//     if (method === 'GET') {
//       return of(new HttpResponse({ status: 200, body: transacoes })).pipe(delay(150));
//     }

//     if (method === 'POST') {
//       const body = req.body as Transacao;
//       transacoes.push(body);
//       setStored('tcc_transacoes', transacoes);
//       return of(new HttpResponse({ status: 201, body })).pipe(delay(150));
//     }

//     if (method === 'PUT') {
//       const titulo = decodeURIComponent(path.split('/').pop() || '');
//       const body = req.body as Transacao;
//       const index = transacoes.findIndex(t => t.titulo === titulo);
//       if (index !== -1) {
//         transacoes[index] = { ...transacoes[index], ...body };
//         setStored('tcc_transacoes', transacoes);
//         return of(new HttpResponse({ status: 200, body: transacoes[index] })).pipe(delay(150));
//       }
//       return of(new HttpResponse({ status: 404, body: { error: 'Transação não encontrada' } })).pipe(delay(150));
//     }

//     if (method === 'DELETE') {
//       const titulo = decodeURIComponent(path.split('/').pop() || '');
//       const filtered = transacoes.filter(t => t.titulo !== titulo);
//       setStored('tcc_transacoes', filtered);
//       return of(new HttpResponse({ status: 200, body: {} })).pipe(delay(150));
//     }
//   }

//   // 9. Clientes Portfolio (GET, POST/tecnico, PUT, DELETE)
//   if (path.startsWith('/clientes')) {
//     const clientes = getStored('tcc_clientes', defaultClientes);

//     if (method === 'GET') {
//       // Is single client?
//       const parts = path.split('/');
//       if (parts.length > 2 && parts[2] !== 'stats') {
//         const email = parts[2];
//         const cliente = clientes.find(c => c.email === email);
//         if (cliente) {
//           return of(new HttpResponse({ status: 200, body: cliente })).pipe(delay(150));
//         }
//         return of(new HttpResponse({ status: 404, body: { error: 'Cliente não encontrado' } })).pipe(delay(150));
//       }
//       return of(new HttpResponse({ status: 200, body: clientes })).pipe(delay(150));
//     }

//     if (method === 'POST' && path.endsWith('/tecnico')) {
//       const body = req.body as Partial<Cliente>;
//       const newCliente: Cliente = {
//         nome: body.nome || 'Novo Cliente',
//         empresa: body.empresa || 'Nova Empresa',
//         avaliacao: 5.0,
//         email: body.email || 'novo@empresa.com',
//         telefone: body.telefone || '(00) 00000-0000',
//         local: body.local || 'São Paulo - SP',
//         servicosAtivos: 0,
//         servicosConcluidos: 0,
//         tipoCliente: body.tipoCliente || 'PME',
//         status: body.status || 'Ativo'
//       };
//       clientes.push(newCliente);
//       setStored('tcc_clientes', clientes);
//       return of(new HttpResponse({ status: 201, body: newCliente })).pipe(delay(150));
//     }

//     if (method === 'PUT') {
//       const email = path.split('/').pop();
//       const body = req.body as Cliente;
//       const index = clientes.findIndex(c => c.email === email);
//       if (index !== -1) {
//         clientes[index] = { ...clientes[index], ...body };
//         setStored('tcc_clientes', clientes);
//         return of(new HttpResponse({ status: 200, body: clientes[index] })).pipe(delay(150));
//       }
//       return of(new HttpResponse({ status: 404, body: { error: 'Cliente não encontrado' } })).pipe(delay(150));
//     }

//     if (method === 'DELETE') {
//       const email = path.split('/').pop();
//       const filtered = clientes.filter(c => c.email !== email);
//       setStored('tcc_clientes', filtered);
//       return of(new HttpResponse({ status: 200, body: {} })).pipe(delay(150));
//     }
//   }

//   // 10. Serviços Profissionais (GET, POST, PUT, DELETE)
//   if (path.startsWith('/servicos')) {
//     const servicos = getStored('tcc_servicos', defaultServicos);

//     if (method === 'GET') {
//       const parts = path.split('/');
//       if (parts.length > 2) {
//         const titulo = decodeURIComponent(parts[2]);
//         const servico = servicos.find(s => s.titulo === titulo);
//         if (servico) {
//           return of(new HttpResponse({ status: 200, body: servico })).pipe(delay(150));
//         }
//         return of(new HttpResponse({ status: 404, body: { error: 'Serviço não encontrado' } })).pipe(delay(150));
//       }
//       return of(new HttpResponse({ status: 200, body: servicos })).pipe(delay(150));
//     }

//     if (method === 'POST') {
//       const body = req.body as Servico;
//       servicos.push(body);
//       setStored('tcc_servicos', servicos);
//       return of(new HttpResponse({ status: 201, body })).pipe(delay(150));
//     }

//     if (method === 'PUT') {
//       const titulo = decodeURIComponent(path.split('/').pop() || '');
//       const body = req.body as Servico;
//       const index = servicos.findIndex(s => s.titulo === titulo);
//       if (index !== -1) {
//         servicos[index] = { ...servicos[index], ...body };
//         setStored('tcc_servicos', servicos);
//         return of(new HttpResponse({ status: 200, body: servicos[index] })).pipe(delay(150));
//       }
//       return of(new HttpResponse({ status: 404, body: { error: 'Serviço não encontrado' } })).pipe(delay(150));
//     }

//     if (method === 'DELETE') {
//       const titulo = decodeURIComponent(path.split('/').pop() || '');
//       const filtered = servicos.filter(s => s.titulo !== titulo);
//       setStored('tcc_servicos', filtered);
//       return of(new HttpResponse({ status: 200, body: {} })).pipe(delay(150));
//     }
//   }

//   // Fallback for unexpected endpoints
//   return of(new HttpResponse({ status: 404, body: { error: 'Not Found' } })).pipe(delay(150));
// };
