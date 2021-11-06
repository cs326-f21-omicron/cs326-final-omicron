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
| User info                |         | Cleanup     | Primary      |
| Recommendations (Backup) |         | Cleanup     | Primary      |
| README                   | Yes     | Yes         | Yes          |

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

```

```

```

```
