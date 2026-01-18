# About
![example screenshot](image.png)
This is a weekend project to find small and medium-sized businesses that have a website but whose site no longer meets today’s standards.
It was implemented with Node and Angular.
The backend crawls the websites and looks for email addresses to contact me.
it looks for companies in a radius and finds emails/websites.
If none are found we enrich the data trhough queries.
Choices will be remembered an an email can be sent to customer if they wish to get in touch to improve their websites.
I also want to make some more analysis on this, as i manually have to look at websites right now. 

This Project uses:

- frontend: an Angular application deployed with nginx.
- email: A FastAPI endpoint to sent mails to pot. customers
- crawler: a tool to crawl websites of customers.

For deployments I use a combination of Helm and skaffold to make deploying and testing easier.

## Setup

you have to run the following command:
`cp /helm/webscanner/values-dev.yaml.example /helm/webscanner/values-dev.yaml`
then, if you run:
`skaffold dev`
the project should set itself up.

(Maildev is to verify if the connection works )
to reach maildev you have to add to your /etc/hosts:
[NODE IP] maildev.local
