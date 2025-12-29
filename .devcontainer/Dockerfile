FROM node:24-slim AS dev

WORKDIR /workspace
ARG APP_NAME
ENV PYTHONUNBUFFERED=1
ENV LANG=ja_JP.UTF-8
ENV LANGUAGE=ja_JP:ja
ENV LC_ALL=ja_JP.UTF-8
ENV TERM=xterm-256color
ENV COLORTERM=truecolor

RUN apt-get update \
    && apt-get install -y \
        git \
        ca-certificates \
        zsh \
        vim \
        make \
        locales \
        --no-install-recommends \
    && update-ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen \
    && sed -i '/ja_JP.UTF-8/s/^# //g' /etc/locale.gen \
    && locale-gen \
    && useradd -m appuser

# pnpm セットアップ
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --chown=appuser:appuser . /workspace

# Cursor MCP設定をコピー
RUN mkdir -p /home/appuser/.cursor
COPY --chown=appuser:appuser mcp.json /home/appuser/.cursor/mcp.json

RUN ln -sf /bin/zsh /bin/sh
RUN usermod -s /bin/zsh appuser
USER appuser

# zsh用コマンド保管インストール
RUN git clone https://github.com/zsh-users/zsh-autosuggestions /home/appuser/.zsh/zsh-autosuggestions

FROM node:24-slim AS prod

WORKDIR /workspace

# pnpm セットアップ（本番も必要）
RUN corepack enable && corepack prepare pnpm@latest --activate

# dev ステージから node_modules とビルド成果物をコピー
COPY --from=dev /workspace/package.json /workspace/pnpm-lock.yaml ./
COPY --from=dev /workspace/node_modules ./node_modules
COPY --from=dev /workspace/.next ./.next
COPY --from=dev /workspace/public ./public

EXPOSE 3000
CMD ["pnpm", "start"]