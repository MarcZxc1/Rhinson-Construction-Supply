FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .

# Vite's default dev port
EXPOSE 5173 
# Running in dev mode for now so you can see changes
CMD ["npm", "run", "dev", "--", "--host"]