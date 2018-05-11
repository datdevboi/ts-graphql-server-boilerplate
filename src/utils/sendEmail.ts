import * as Sparkpost from "sparkpost";

const client = new Sparkpost(process.env.SPARKPOST_API_KEY as string);

export default async (recipient: string, url: string) => {
  const response = await client.transmissions.send({
    options: {
      sandbox: true
    },
    content: {
      from: "testing@sparkpostbox.com",
      subject: "Confirm Email",
      html: `<html><body><p>Testing SparkPost - the world's most awesomest email service!</p>
      <a href=${url}>Confirm Email</a>
      </body></html>`
    },
    recipients: [{ address: recipient }]
  });

  console.log(response);
};
