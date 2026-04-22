**PRODUCT REQUIREMENTS DOCUMENT**

Architectural Project Management Platform

*Version 1.0 · April 2025*

**1. Product Overview**

This document describes the requirements for a web platform for centralized management of architectural projects. The platform provides a unified environment where construction and architectural companies can track project progress, coordinate teams, and control work stages in real time.

  ----------------------- -----------------------------------------------
  **Field**               Value

  **Product Name**        Build Control --- Architectural Project
                          Management Platform

  **Document Version**    1.0

  **Date**                April 2025

  **Status**              In Development

  **Contact Number**      +996 777 77 77 77
  ----------------------- -----------------------------------------------

**2. Objectives and Goals**

**2.1 Business Goals**

-   Provide a unified platform for managing multiple architectural projects
    from different companies

-   Increase transparency and control at each stage of a construction
    project

-   Simplify interaction between managers, foremen, and workers

-   Reduce time spent on reporting and task coordination

**2.2 Product Goals**

-   Create a convenient interface for three types of users with different
    access levels

-   Provide visual tracking of development stages for each project

-   Implement a managed access system --- accounts are created only by
    the administrator

-   Develop an attractive Landing Page to attract new companies

**3. Users and Roles**

The platform supports four roles. Access to the system is provided exclusively
through the administrator.

  ------------------- -------------------- -----------------------------------------------
  **Role**            **Who**               **Main Access Rights**

  **Administrator**   *Platform owner*     Full access: create/delete users and companies,
                                           system configuration, view all data

  **Manager**         *Project leader      Create and manage projects, assign tasks to
                      in the company*      foremen, view stage reports

  **Foreman**         *Responsible for     View their projects and stages, update stage
                      work execution*      statuses, manage workers

  **Worker**          *On-site executor*   View assigned tasks, mark completed work
  ------------------- -------------------- -----------------------------------------------

**4. Functional Requirements**

**4.1 Landing Page**

The Landing Page is the entry point for new clients and companies. It does not
require authorization.

  ---------------------- --------------------------------- ---------------
  **Function**           **Description**                   **Priority**

  **Hero Section**       Headline, brief platform          **High**
                         description, CTA button "Get
                         Started"

  **Features Block**     Description of key functions:    **High**
                         project management, stages, team
                         roles

  **Contact Block**      Display phone number: +996 777    **High**
                         77 77 77 with a call-to-action
                         to get an account

  **Testimonials /       Block with benefits and          Medium
  About Us**             platform credibility

  **Responsive Design**  Correct display on mobile and    **High**
                         desktop devices
  ---------------------- --------------------------------- ---------------

**Important: Call-to-action for account access**

The Landing Page must clearly display a call-to-action: "To get started, call
us at +996 777 77 77 77 --- we will create an account for your company". The
"Login" button should lead to the authorization page.

**4.2 Authorization and Account Management**

  ---------------------- --------------------------------- ---------------
  **Function**           **Description**                   **Priority**

  **Login Page**         Login + password form, "Sign      **High**
                         In" button, link to contact
                         number for access

  **Account Creation**   Only administrator can create,    **High**
                         edit, and deactivate accounts

  **Password Reset**     Administrator manually resets     Medium
                         user password

  **Sessions**           Secure JWT sessions, auto         **High**
                         logout when time expires

  **Access Control**     After login, each user sees       **High**
                         only their functional section
                         according to their role
  ---------------------- --------------------------------- ---------------

**4.3 Company Management**

  ---------------------- --------------------------------- ---------------
  **Function**           **Description**                   **Priority**

  **Company List**       Administrator sees all           **High**
                         registered companies on the
                         platform

  **Company Card**       Name, contacts, project list,    **High**
                         list of company users

  **Company Creation**   Administrator creates a          **High**
                         company and assigns managers
                         to it

  **Deactivation**       Ability to suspend access for    Medium
                         the entire company
  ---------------------- --------------------------------- ---------------

**4.4 Project Management**

  ---------------------- --------------------------------- ---------------
  **Function**           **Description**                   **Priority**

  **Project List**       Manager sees all company         **High**
                         projects with brief status
                         summary

  **Project Creation**   Name, description, start date,   **High**
                         end date, foreman assignment

  **Project Card**       Detailed page: description,      **High**
                         progress, list of stages, team

  **Progress Bar**       Visual display of overall        **High**
                         project progress based on stage
                         statuses

  **Project Status**     Planned / In Progress / On       **High**
                         Review / Completed / Frozen

  **Project Archive**    Completed projects are moved     Medium
                         to archive
  ---------------------- --------------------------------- ---------------

**4.5 Project Stages**

Each project is divided into sequential stages. The foreman manages stage
statuses.

  ---------------------- --------------------------------- ---------------
  **Function**           **Description**                   **Priority**

  **Create Stage**       Name, description, planned       **High**
                         start and end dates, responsible
                         person

  **Stage Status**       Not Started / In Progress / On   **High**
                         Review / Completed / Overdue

  **Stage Order**        Stages are displayed in          Medium
                         chronological order, can set
                         dependencies

  **Comments**           Ability to leave notes on each   Medium
                         stage

  **Stage Files**        Upload documents, drawings,      Medium
                         photos for the stage

  **Notifications**      Alert foreman when status        Low
                         changes or deadline approaches
  ---------------------- --------------------------------- ---------------

**4.6 Dashboards**

  ---------------------- --------------------------------- ---------------
  **Function**           **Description**                   **Priority**

  **Manager Dashboard**  Summary of all projects:         **High**
                         progress, deadlines, tasks
                         requiring attention

  **Foreman Dashboard**  List of stages in progress,      **High**
                         upcoming deadlines, worker
                         tasks

  **Worker Dashboard**   List of assigned tasks for       **High**
                         today and current week

  **Admin Dashboard**    Platform statistics: total       **High**
                         companies, active projects,
                         users

  **Widget System**      Ability to customize and rearrange  Medium
                         dashboard widgets
  ---------------------- --------------------------------- ---------------

**4.7 Task Management**

Tasks are atomic units of work assigned by the foreman to workers within
a stage.

  ---------------------- --------------------------------- ---------------
  **Function**           **Description**                   **Priority**

  **Create Task**        Name, description, responsible   **High**
                         worker, deadline, optional
                         reference photo ("Before")

  **Task Status**        Not Started / In Progress / On   **High**
                         Review / Completed / Returned

  **Assign Worker**      Foreman assigns one or more      **High**
                         workers to a task

  **Before Photo**       Optional: reference photo       **High**
                         showing what the result should
                         look like

  **After Photo**        Mandatory: worker uploads photo  **High**
                         upon completion (system prevents
                         completion without it)

  **Photo Comparison**   Side-by-side view of Before/     **High**
                         After photos

  **Photo Approval**     Foreman can accept or return     **High**
                         task with comment for revision

  **Task Comments**      Discussion thread for each task  Medium

  **Checklist**          Task can include a list of       Medium
                         sub-items to complete
  ---------------------- --------------------------------- ---------------

**User Stories: Task Management**

-   As a foreman, when creating a task, I want to optionally attach a
    reference photo so the worker understands what needs to be done

-   As a worker, I want to see the reference photo on the task screen to
    understand the expected result before starting

-   As a worker, when I complete a task, I must upload a photo of the result
    --- the system will not allow completion without it

-   As a foreman, I want to see the Before and After photos side by side to
    quickly assess work quality

-   As a foreman, if the result is unsatisfactory, I want to return the task
    with a comment explaining what needs to be redone

-   As a worker, I want to see the foreman's comment explaining what I need to
    fix and resubmit the task

-   As a foreman, I want to easily distinguish between initial task
    submissions and revisions with timestamp history

-   As a manager, I want to see task completion rates by worker to evaluate
    team performance

**4.8 Photo Report**

The Photo Report is a visual record of project progress with photo evidence
for quality control.

  ---------------------- --------------------------------- ---------------
  **Function**           **Description**                   **Priority**

  **Photo Gallery**      View all Before and After photos **High**
                         for a project or stage, grouped
                         by task

  **Gallery Filters**    Filter by stage, upload date,    Medium
                         executor, task status

  **Export Photo         Download ZIP archive with photo  Low
  Report**               report for a project or specific
                         stage

  **Cloud Storage**      Photos stored in cloud storage   **High**
                         (S3 or similar). Links are
                         protected from public access
  ---------------------- --------------------------------- ---------------

**User Stories: Photo Report**

-   As a foreman, when creating a task, I want to attach a reference photo so
    the worker understands what exactly needs to be done

-   As a worker, I want to see the Before photo on the task screen to
    understand the expected result before starting work

-   As a worker, when I complete a task, I must upload a result photo --- the
    system will not allow completion without it

-   As a foreman, I want to see Before and After photos side by side to
    quickly assess work quality

-   As a foreman, if the result doesn't satisfy me, I want to return the task
    with a comment about what needs to be redone

-   As a manager, I want to view all photos for a stage in one gallery to
    assess site progress

**5. Non-Functional Requirements**

**5.1 Performance**

-   Page load time --- no more than 2 seconds on standard connection

-   Support for up to 500 concurrent users at initial stage

-   System availability (Uptime) --- at least 99.5%

**5.2 Security**

-   HTTPS for all pages and requests

-   JWT tokens with limited validity period

-   Data segregation between companies --- Company A cannot see Company B data

-   Logging of all administrator actions

**5.3 Usability**

-   Interface in Russian language (with possibility of adding Kyrgyz)

-   Responsive design for mobile devices and tablets

-   No more than 3 clicks to any key function

**5.4 Scalability**

-   Architecture should support adding new company and project types

-   Ability to integrate external systems in the future (messengers,
    accounting)

**6. User Stories**

**6.1 Manager**

-   As a manager, I want to see all my projects on one screen to quickly assess
    the overall situation

-   As a manager, I want to create a new project and break it down into stages
    to assign them to a foreman

-   As a manager, I want to see the progress of each stage to respond to delays
    in time

**6.2 Foreman**

-   As a foreman, I want to see a list of my stages with deadlines to plan team
    work

-   As a foreman, I want to update stage status and add a comment so the manager
    stays informed

-   As a foreman, I want to attach a photo from the site to a stage to confirm
    completion

**6.3 Worker**

-   As a worker, I want to see my tasks for today to know what to do

-   As a worker, I want to mark a task as completed so the foreman sees
    progress

**6.4 Administrator**

-   As an administrator, I want to create an account for a new company and its
    manager after a client call

-   As an administrator, I want to deactivate a user if they no longer work at
    the company

-   As an administrator, I want to see statistics for all companies and projects
    on the platform

**7. Page Map and Navigation**

  ------------------------- ----------------------- ----------------------
  **Page / Section**        **Access**              **Purpose**

  / (Landing Page)          All (no authorization)  Marketing + contacts

  /login                    All (no authorization)  System login

  /dashboard                All roles               Personal control panel

  /projects                 Manager, Foreman        Project list

  /projects/:id             Manager, Foreman        Project details and
                                                    stages

  /projects/:id/stages      Manager, Foreman        Stage management

  /tasks                    Foreman, Worker         Tasks and assignments

  /admin/companies          Administrator           Company management

  /admin/users              Administrator           User management

  /admin/stats              Administrator           Platform statistics
  ------------------------- ----------------------- ----------------------

**8. Out of Scope (v1.0)**

The following functions are not included in the first version of the platform
but may be considered in future releases:

-   Integration with messengers (WhatsApp, Telegram)

-   Native mobile application (iOS / Android)

-   Built-in chat between users

-   Billing and payment through the platform

-   Integration with accounting systems

-   PDF report generation for projects

-   Geolocation of objects on map

**9. Development Priorities (MoSCoW)**

**Must Have --- Required**

-   Landing Page with contact number for account access

-   Authorization system (login, sessions, roles)

-   Administrative panel: company and user management

-   Project management: create, view, statuses

-   Stage management: create, statuses, progress

-   Personal Dashboard for each role

-   Before photo when creating task (optional, attached by foreman)

-   After photo when completing task (mandatory, uploaded by worker)

-   Before/After photo comparison mode + task approval or return for revision

**Should Have --- Desirable**

-   Comments on stages

-   File and document upload to stages

-   Deadline notifications

-   Archive of completed projects

-   Photo gallery for project/stage with filters

-   Photo report version history for retry attempts

**Could Have --- If Possible**

-   Statistics and analytics for administrator

-   Filtering and search by projects/stages

-   Change history (audit log)

-   Export photo report as ZIP archive for project or stage

**10. Assumptions and Constraints**

-   Each user belongs to exactly one company

-   User registration is only possible through platform administrator

-   Initial client contact is by phone: +996 777 77 77 77

-   Platform is developed for browser use (web application)

-   Primary interface language is English

-   Data from different companies is strictly isolated from each other

*Document prepared for internal use | v1.0 | 2025*
