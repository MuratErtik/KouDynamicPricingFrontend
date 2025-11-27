
FROM node:22-alpine AS build

WORKDIR /app


COPY package.json package-lock.json* yarn.lock* ./

RUN npm install        


COPY . .

# create build
RUN npm run build      


# Stage 2: static serve with Nginx
FROM nginx:1.27-alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
