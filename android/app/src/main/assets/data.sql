CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `mobilenumber` int(11) NOT NULL,
  `username` varchar(225) DEFAULT NULL,
  `password` varchar(6000) NOT NULL,
  `role_id` varchar(255) NOT NULL,
  `dob` varchar(255) DEFAULT NULL,
  `latitude` varchar(255) DEFAULT NULL,
  `longitude` varchar(255) DEFAULT NULL,
  `is_verified` int(1) DEFAULT 0,
  `is_active` int(1) DEFAULT 0,
  `inserted_datetime` varchar(255) NOT NULL,
  PRIMARY KEY (`id`,`inserted_datetime`)
);

CREATE TABLE `food_requests` (
  `id` int(11) NOT NULL,
  `requester_id` int(11) NOT NULL,
  `food_type` varchar(225) DEFAULT NULL,
  `foodname` varchar(225) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `quantity` varchar(255) DEFAULT NULL,
  `beneficiaries` int(11) DEFAULT NULL,
  `max_datetime` varchar(255) DEFAULT NULL,
  `latitude` varchar(255) DEFAULT NULL,
  `longitude` varchar(255) DEFAULT NULL,
  `requested_datetime` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT 'PENDING',
  PRIMARY KEY (`id`)
);

CREATE TABLE `donation_requests` (
  `id` int(11) NOT NULL,
  `donor_id` int(11) NOT NULL,
  `food_type` varchar(225) DEFAULT NULL,
  `foodname` varchar(225) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `quantity` varchar(255) DEFAULT NULL,
  `beneficiaries` int(11) DEFAULT NULL,
  `max_datetime` varchar(255) DEFAULT NULL,
  `latitude` varchar(255) DEFAULT NULL,
  `longitude` varchar(255) DEFAULT NULL,
  `requested_datetime` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT 'PENDING',
  PRIMARY KEY (`id`)
);

CREATE TABLE `image_details` (
  `ID` int(11) NOT NULL,
  `userid` varchar(250) NOT NULL,
  `request_id` varchar(250) default NULL,
  `requested_datetime` varchar(250) default NULL,
  `fileid` varchar(250) default NULL,
  `filename` varchar(250) default NULL,
  `fileuri` varchar(250) default NULL,
  `file` BLOB default NULL,
  `uploaded_datetime` varchar(250) NOT NULL,
  PRIMARY KEY  (`ID`,`userid`,`uploaded_datetime`)
);