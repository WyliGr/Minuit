# Minuit.strs
> Minuit at Strasbourg, after a good movie at the theater

**Minuit** is a aggregator of movie schedules for every Strasbourg Theater :
Le Vox, UGC Rivétoile, Le Cosmos, Le Star et Le Star Saint-Exupéry 

Beacause there is a lot of différents theaters, there is a lot of movies scheduled everyday, and always the on that fits your planning. But the problem was, 5 theaters means 5 schedules, 5 differents website, 5 ways to find the schedule.

**Minuit** makes it easy, one schedule to rule them all. 

> [!NOTE]
> You can find my instance of minuit running there : 
> https://minuit.wyliam.fr

### How it's made ?
This project is forked from another project of mine, the *Strasbourg Theater Movie Parser*. An n8n workflow that typically does the same but the data was sent by discord. 

Today, the backend is still an n8n workflow with Webhooks usage. But with  real frontend devlopped with Astro, Vue and TailwindCSS.
### How to deploy your own instance ?
You will need two things :
- An n8n Server
- Docker

**0. Clone the github repo**
Like every github project, clone the repo on your computer.

```bash
git clone git@github.com:WyliGr/Minuit-strs.git
```

**1. Setup the Backend**
On your n8n server, import the file ```n8n-backend.json``` and setup the webhook URL. Keep this url it's going to be useful later.

**2. Setup the frontend (For Linux)**
On the **Minuit-strs** folder, open your favorite IDE like VSCode and modifiy the file ```./frontend/src/pages/index.astro``` and replace my API URL by yours that you saved from the n8n step.

Then save and run a terminal to type :
```bash
docker compose up --build -d
```

Mac and windows users, figure it on your own :)

**3. Access the UI**
You can now access the Web UI at : 
- http://*YOUR-IP*:3000
- http://localhost:3000

### More Informations

**Folder Structure**
```
/
├── frontend/ # Astro frontend application
│ ├── src/ # Source files
│ │ ├── components/ # Vue components
│ │ ├── pages/ # Astro pages
│ │ ├── services/ # API services
│ │ ├── styles/ # CSS files
│ │ └── utils/ # Utility functions
│ └── public/ # Static assets
├── n8n-backend.json # n8n workflow configuration
├── Dockerfile # Multi-stage Docker build
├── docker-compose.yml # Docker Compose configuration
└── README.md # Project documentation
```

