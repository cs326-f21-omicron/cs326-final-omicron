# _HobbShop_

[Github Repo](https://github.com/cs326-f21-omicron/cs326-final-omicron)

# Team Omicron

- Hung Do ([hungmhdo](https://github.com/hungmhdo))
- Luke Nguyen ([lukednguyen](https://github.com/lukednguyen))
- Kirk Smalley ([kjsmalley](https://github.com/kjsmalley))

# Division of labor

| Part                     | Hung Do | Luke Nguyen | Kirk Smalley |
| ------------------------ | ------- | ----------- | ------------ |
| Sign up                  | Primary | Cleanup     |              |
| Login                    | Primary | Cleanup     |              |
| Messages                 |         | Primary     |              |
| Landing                  |         | Primary     |              |
| Homepage/Recommendations | Primary | Cleanup     |              |
| Homepage Server          | Primary | Cleanup     |              |
| User info                |         |             | Primary      |
| User info-server         |         |             | Primary      |
| User info-js             |         |             | Primary      |

# API Planning

## Sign-up API

| METHOD | ACTION             |
| ------ | ------------------ |
| POST   | Create new account |

| PARAMETER | DESCRIPTION                                   | EXAMPLE          |
| --------- | --------------------------------------------- | ---------------- |
| mail      | The unique string identifying user's email    | john@awesome.com |
| password  | The unique string identifying user's password | awesome@john.123 |

**Sample request body**

```json
{
  "mail": "johndoe@awesome.com",
  "password": "John@0123"
}
```

**Response**

- **200**: Success
- **400**: Invalid request body
  ```json
  {
    "message": ""
  }
  ```
- **500**: Internal server error

## Sign-in API

| METHOD | ACTION                                                                                      |
| ------ | ------------------------------------------------------------------------------------------- |
| POST   | Looking for a user that have the unique identifier as the combination of email and password |

| PARAMETER | DESCRIPTION                                   | EXAMPLE          |
| --------- | --------------------------------------------- | ---------------- |
| mail      | The unique string identifying user's email    | john@awesome.com |
| password  | The unique string identifying user's password | awesome@john.123 |

**Sample request body**

```json
{
  "mail": "johndoe@awesome.com",
  "password": "John@0123"
}
```

**Response**

- **200**: Success
- **400**: Invalid request body or user not found
  ```json
  {
    "message": ""
  }
  ```
- **500**: Internal server error

## Suggestion API

| METHOD | ACTION                                    |
| ------ | ----------------------------------------- |
| GET    | Get suggestion post list for for a userId |

| PARAMETER | DESCRIPTION                                | EXAMPLE                     |
| --------- | ------------------------------------------ | --------------------------- |
| userId    | The unique string identifying id of a user | uy312afbnw231oapqks31lap312 |

**Sample**

```json
curl --request GET
  --url https://localhost:8080/suggestion?userId=uy312afbnw231oapqks31lap312
  --header 'Authorization: '
  --header 'Content-Type: application/json'
```

**Response**

- **200**: Success

  ```json
  [
    {
      "id": "1",
      "name": "Camping",
      "posts": [
        {
          "id": "1",
          "title": "Camping with me and Luke",
          "imageUrl": "https://images.unsplash.com/photo-1532339142463-fd0a8979791a?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80",
          "location": "Amherst",
          "time": "3d",
          "user_profile": "https://avatars.githubusercontent.com/u/70021320?v=4"
        },
        {
          "id": "2",
          "title": "We host camping events every weekend",
          "imageUrl": "https://images.unsplash.com/photo-1532498551838-b7a1cfac622e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
          "location": "Holyoke",
          "time": "4d",
          "user_profile": "https://github.com/lukednguyen.png"
        },
        {
          "id": "3",
          "title": "Open for any camping event this weekend",
          "imageUrl": "https://images.unsplash.com/photo-1485809052957-5113b0ff51af?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=735&q=80",
          "location": "Worcester",
          "time": "5d",
          "user_profile": "https://github.com/twbs.png"
        }
      ]
    },
    {
      "id": "2",
      "name": "Fishing",
      "posts": [
        {
          "id": "1",
          "title": "Fishing club looking for new members",
          "imageUrl": "https://images.unsplash.com/photo-1485452499676-62ab02c20e83?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80",
          "location": "Amherst",
          "time": "4d",
          "user_profile": "https://avatars.githubusercontent.com/u/70021320?v=4"
        },
        {
          "id": "2",
          "title": "Need someone to teach me fishing",
          "imageUrl": "https://images.unsplash.com/photo-1515631604561-23e0be68ee06?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80",
          "location": "Amherst",
          "time": "4d",
          "user_profile": "https://github.com/twbs.png"
        }
      ]
    }
  ]
  ```

- **500**: Internal server error