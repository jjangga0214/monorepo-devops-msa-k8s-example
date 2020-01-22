# syntax=docker/dockerfile:experimental
FROM node:12-alpine AS builder
ARG PACKAGE
# [WARN] Do not override this env var at runtime
ENV PACKAGE ${PACKAGE}
ENV YARN_CACHE_FOLDER /repo/yarn-cache
WORKDIR /repo
COPY build-helper ./build-helper/
RUN --mount=type=cache,target=/repo/yarn-cache yarn --cwd /repo/build-helper install --silent --frozen-lockfile
# install devDependencies on project root
COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/repo/yarn-cache yarn install --silent --frozen-lockfile
COPY lerna.json LICENSE tsconfig.* ./
COPY packages ./packages/
# delete unnecessary packages
RUN yarn --cwd /repo/build-helper run prune
RUN --mount=type=cache,target=/repo/yarn-cache yarn install --silent --frozen-lockfile
RUN yarn pkg build
# delete unnecessary stuff except compiled code
RUN yarn --cwd /repo/build-helper run clean

FROM node:12-alpine
ARG PACKAGE
ENV PACKAGE ${PACKAGE}
ENV PORT 8080
ENV YARN_CACHE_FOLDER /repo/yarn-cache
WORKDIR /repo
COPY --from=builder /repo/ ./
EXPOSE ${PORT}
RUN --mount=type=cache,target=/repo/yarn-cache yarn install --silent --frozen-lockfile --production
RUN rm -rf ${YARN_CACHE_FOLDER}
CMD ["yarn", "pkg", "start"]
