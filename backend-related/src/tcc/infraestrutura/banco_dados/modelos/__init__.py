# Import all models to ensure they are registered with SQLAlchemy
from .modelo_user import ModeloUsuario, TipoPerfil
from .modelo_cliente import ModeloCliente
from .modelo_profissional import ModeloProfissional
from .modelo_categoria_servico import ModeloCategoriaServico
from .modelo_chamado import ModeloChamado, StatusChamado
from .modelo_favorito import ModeloFavorito
from .modelo_inventario import ModeloInventario
from .modelo_agendamento import ModeloAgendamento
from .modelo_servico import ModeloServico
from .modelo_transacao import ModeloTransacao