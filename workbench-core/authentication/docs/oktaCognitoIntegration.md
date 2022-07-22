# Okta Integration into Cognito

## Description

Set-by-step instructions for integrating Okta into Cognito

## Usage

### Requirements:
- The user pool to integrate with has been preconfigured, including a domain and an app client
- The app client is configured to use the **Authorization code grant** OAuth 2.0 grant type

### Steps

1. Navigate to [Okta](https://www.okta.com/), register if necessary, and sign in
2. Create an Okta app
   1. Open the Okta Admin Console
   2. In the navigation pane, expand **Applications**, and then click **Applications**
   3. Click **Create App Integration**
   4. Select **OpenID Connect** and **Web Application**
   5. Click **Next**
3. Configure settings for your Okta app
   1. Give your app a name. For example, **ExampleApp**
   2. Under **Grant type**, ensure only **Authorization Code** is checked
   3. For Sign-in redirect URIs, enter **https://\<domain prefix\>.auth.\<region\>.amazoncognito.com/oauth2/idpresponse**
      - Note: Replace **domain prefix** and **region** with your Cognito user pool's domain prefix and region
   4. In Controlled access, choose your preferred access setting, and then click **Save**
   5. On the General page, in Client Credentials, note the **Client ID** and **Client secret**. You need these credentials for configuring Okta in your Amazon Cognito user pool
   6. On the Sign On page, in OpenID Connect ID Token, click **Edit**
   7. Change **Issuer** from **Dynamic** to **Okta URL** and note the **Issuer URL**. You need this URL for configuring Okta in your Amazon Cognito user pool
4. Add an OIDC IdP in your user pool
   1.  In the Amazon Cognito console, navigate to your user pool
   2.  In the user pool console, click the **Sign-in experience** tab
   3.  Under **Federated identity provider sign-in**, click **Add identity provider** and select **OpenID Connect (OIDC)**
   4.  Do the following:
       1. For Provider name, enter a name for the IdP. This name appears in the Amazon Cognito hosted web UI
          - Note: You can't change this field after creating the provider, so use a name that you're comfortable with your app's users seeing
          - Note: The name cannot contain spaces or underscores
       2. For Client ID, input the **Client ID** that you noted earlier from Okta
       3. For Client secret, input the **Client secret** that you noted earlier from Okta
       4. For Authorize scope, input these scopes: `openid email profile`. These are the scopes required for the default authentication services
       5. For Attribute request method, leave the setting as **GET**
       6. For Issuer, leave **Auto fill through issuer URL** selected and input the Issuer URL that you copied earlier from Okta
       7. For Map attributes, add the following mappings. These are the mappings required for the default authentication services
          | User Pool Attribute | OpenID Connect attribute |
          | ------------------- | ------------------------ |
          | email               | email                    |
          | family_name         | family_name              |
          | given_name          | given_name               |
   5.  Click **Add identity provider**
5. Add the created Okta IdP to your app client
   1. In the Amazon Cognito console, navigate to your user pool app client
   2. On the app client page, under Hosted UI, click **Edit**
   3. Under Identity Providers, select your newly created Okta IdP
   4. Click **Save changes**
   5. Under Hosted UI, click **View Hosted UI** to view your newly created Okta IdP in the hosted UI
