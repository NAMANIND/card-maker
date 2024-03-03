import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { v2 as cloudinary } from "cloudinary";

import Layout from "@components/Layout";
import Container from "@components/Container";
import Button from "@components/Button";

import images from "@data/images";

import styles from "@styles/User.module.scss";

export default function User({ user, ogImageUrl }) {
  const [downloadUrl, setDownloadUrl] = useState(null);

  async function handleOnDownload() {
    try {
      // Upload the transformed image to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(ogImageUrl, {
        public_id: "transformed_image",
        resource_type: "image",
        type: "upload",
        fetch_format: "auto",
        quality: "auto",
      });

      // Set the download URL to the URL of the uploaded image
      setDownloadUrl(uploadResponse.secure_url);
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
    }
  }

  return (
    <Layout>
      <Head>
        <title>{user.name} - GitHub Profiler</title>
        <meta name="description" content={`GitHub profile for ${user.name}`} />
        <meta property="og:title" content={`${user.name} - GitHub Profiler`} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:secure_url" content={ogImageUrl} />
        <meta property="og:image:width" content="2024" />
        <meta property="og:image:height" content="1012" />
        <meta
          property="twitter:title"
          content={`${user.name} - GitHub Profiler`}
        />
        <meta property="twitter:image" content={ogImageUrl} />
        <meta property="twitter:card" content="summary_large_image" />
      </Head>

      <Container>
        <h1 className={styles.title}>{user.name}</h1>

        <p className={styles.username}>@{user.login}</p>

        <div className={styles.profile}>
          <Image
            width="402"
            height="402"
            src={user.avatar_url}
            alt={`${user.login} GitHub avatar`}
          />
          <div className={styles.profileContent}>
            <p className={styles.profileBio}>{user.bio}</p>
            <p className={styles.profileCompany}>
              Works at <strong>{user.company}</strong>
            </p>
            <ul className={styles.profileStats}>
              <li>
                <strong>Public Repos</strong>: {user.public_repos}
              </li>
              <li>
                <strong>Followers</strong>: {user.followers}
              </li>
            </ul>
            <p className={styles.profileTwitter}>
              Follow on Twitter at{" "}
              <a href={`https://twitter.com/${user.twitter_username}`}>
                @{user.twitter_username}
              </a>
            </p>
          </div>
        </div>

        <h2 className={styles.header}>Share This Profile</h2>

        <img
          width="700"
          height="1102"
          src={ogImageUrl}
          style={{ border: "solid 2px blueviolet" }}
          alt="Social Card Preview"
        />

        <div>
          <Button onClick={handleOnDownload}>Download Image</Button>
          {downloadUrl && (
            <div>
              <a href={downloadUrl} download="profile_image.jpg">
                Download Transformed Image
              </a>
            </div>
          )}
        </div>

        <h2 className={styles.header}>Try Another Profile</h2>

        <p>
          <Link href="/">
            <a>Back to Start</a>
          </Link>
        </p>
      </Container>
    </Layout>
  );
}

export async function getServerSideProps({ params }) {
  const user = await fetch(
    `https://api.github.com/users/${params.username}`
  ).then((r) => r.json());

  cloudinary.config({
    cloud_name: "dcijnycwn",
    api_key: "157937658118738",
    api_secret: "KineJAztVYvQ9m5PWb8hOTLwco0",
    secure: true,
  });

  const cloudinaryUrl = cloudinary.url("hrsvctkdjoskq4yz5cnj", {
    width: 700,
    height: 1102,
    transformation: [
      {
        fetch_format: "auto",
        quality: "auto",
      },
      {
        overlay: {
          url: user.avatar_url,
        },
      },
      {
        flags: "layer_apply",
        width: 300,
        height: 300,
        y: -220,
      },
      {
        color: "#4D57F6",
        crop: "fit",
        width: 432,
        overlay: {
          font_family: "Source Sans Pro",
          font_size: 60,
          font_weight: "bold",
          text: user.name,
        },
      },
      {
        color: "#627597",
        crop: "fit",
        width: 432,
        overlay: {
          font_family: "Source Sans Pro",
          font_size: 34,
          font_weight: "semibold",
          text: `@${user.login}`,
        },
      },
      {
        flags: "layer_apply",
        gravity: "north_west",
        y: "h + 10",
      },
      {
        color: "#24292F",
        crop: "fit",
        width: 432,
        overlay: {
          font_family: "Source Sans Pro",
          font_size: 28,
          font_weight: "semibold",
          text: `${user.followers} Followers    ${user.public_repos} Public Repos`,
          crop: "fit",
        },
      },
      {
        flags: "layer_apply",
        gravity: "north_west",
        y: "h + 24",
      },
      {
        flags: "layer_apply",
        gravity: "north_west",
        x: 106,
        y: 80,
      },
      // Specify format and attachment for download
      {
        fetch_format: "auto",
        fl_attachment: "filename.jpg",
      },
    ],
  });

  return {
    props: {
      user,
      ogImageUrl: cloudinaryUrl,
    },
  };
}
