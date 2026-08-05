"""
Módulo de configurações da aplicação
Carrega variáveis de ambiente usando Pydanic Settings
"""


from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Configuracoes(BaseSettings):
    """
    Classe de configurações da aplicação.

    Carregar variáveis de ambiente do arquivo .env ou do ambiente do sistema.
    todas as configurações necessárias para o funcionamento da aplicação devem ser definidas aqui.
    """

    # Configuração do banco de dados
    # Formato: postgresql+psycopg://usuario:senha@host:porta/banco
    DATABASE_URL: str

    # Controla se o Swagger será habilitado e outros comportamentos
    AMBIENTE: str = "dev"

    # Nível de loggine (DEBUG, INFO, WARNING, ERRRO, CRITICAL)
    LOG_LEVEL: str = "INFO"

    model_config = SettingsConfigDict(
        # Buscar o .env na raiz do projeto
        env_file=str(Path(__file__).parent.parent.parent.parent / ".env"),
        env_file_enconding="utf-8",
        case_sensitive=False
    )
    @property
    def prod(self) -> bool:
        return self.AMBIENTE.lower() == "prod"
    @property
    def swagger_habilitado(self) -> bool:
        return not self.prod



configuracoes = Configuracoes()