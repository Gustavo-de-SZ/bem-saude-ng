# Import all schemas to ensure they are properly initialized
from .agendamento_schema import AgendamentoResponse
from .servico_schema import ServicoCreate, ServicoResponse, ServicoUpdate
from .transacao_schema import TransacaoCreate, TransacaoResponse
from .categoria_schema import CategoriaResponse
from .chamado_schema import ChamadoCreate, ChamadoResponse, ChamadoFrontendResponse
from .cliente_schema import ClienteCriarRequest, ClienteResponse
from .profissional_schema import ProfissionalCriarRequest, ProfissionalResponse
from .usuario_schema import UsuarioCriarRequest, UsuarioAlterarRequest, UsuarioResponse, TipoPerfil