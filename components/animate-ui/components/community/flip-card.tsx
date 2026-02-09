"use client";

import { Button } from "@/components/ui/button";
import { easeOut, motion } from "motion/react";
import * as React from "react";
import { Github, Linkedin, Twitter } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FlipCardData {
  name: string;
  username: string;
  image: string;
  bio: string;
  stats: {
    following: number;
    followers: number;
    posts?: number;
  };
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
}

type FlipCardProps =
  | {
      data: FlipCardData;
      front?: never;
      back?: never;
      className?: string;
    }
  | {
      data?: never;
      front: React.ReactNode;
      back: React.ReactNode;
      className?: string;
    };

export function FlipCard(props: FlipCardProps) {
  const data = "data" in props ? props.data : undefined;
  const [isFlipped, setIsFlipped] = React.useState(false);

  const handleClick = () => {
    setIsFlipped((prev) => !prev);
  };

  const cardVariants = {
    front: { rotateY: 0, transition: { duration: 0.5, ease: easeOut } },
    back: { rotateY: 180, transition: { duration: 0.5, ease: easeOut } },
  };

  return (
    <div
      className={cn(
        "mt-2 relative w-full h-full perspective-1000 cursor-pointer mx-auto",
        props.className,
      )}
      onClick={handleClick}>
      {/* FRONT: Profile */}
      <motion.div
        className="absolute inset-0 backface-hidden rounded-md border-2 border-foreground/20 px-4 py-6 flex flex-col items-center justify-center bg-gradient-to-br from-muted via-background to-muted text-center"
        animate={isFlipped ? "back" : "front"}
        variants={cardVariants}
        style={{ transformStyle: "preserve-3d" }}>
        {"front" in props ? (
          props.front
        ) : data ? (
          <>
            <img
              src={data.image}
              alt={data.name}
              className="size-20 md:size-24 rounded-full object-cover mb-4 border-2"
            />
            <h2 className="text-lg font-bold text-foreground">{data.name}</h2>
            <p className="text-sm text-muted-foreground">@{data.username}</p>
          </>
        ) : null}
      </motion.div>

      {/* BACK: Bio + Stats + Socials */}
      <motion.div
        className="absolute inset-0 backface-hidden rounded-md border-2 border-foreground/20 px-4 py-6 flex flex-col justify-between items-center gap-y-4 bg-gradient-to-tr from-muted via-background to-muted "
        initial={{ rotateY: 180 }}
        animate={isFlipped ? "front" : "back"}
        variants={cardVariants}
        style={{ transformStyle: "preserve-3d", rotateY: 180 }}>
        {"back" in props ? (
          props.back
        ) : data ? (
          <>
            <p className="text-xs md:text-sm text-muted-foreground text-center">
              {data.bio}
            </p>

            <div className="px-6 flex items-center justify-between w-full">
              <div>
                <p className="text-base font-bold">{data.stats.following}</p>
                <p className="text-xs text-muted-foreground">Following</p>
              </div>
              <div>
                <p className="text-base font-bold">{data.stats.followers}</p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </div>
              {data.stats.posts && (
                <div>
                  <p className="text-base font-bold">{data.stats.posts}</p>
                  <p className="text-xs text-muted-foreground">Posts</p>
                </div>
              )}
            </div>

            {/* Social Media Icons */}
            <div className="flex items-center justify-center gap-4">
              {data.socialLinks?.linkedin && (
                <a
                  href={data.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-105 transition-transform">
                  <Linkedin size={20} />
                </a>
              )}
              {data.socialLinks?.github && (
                <a
                  href={data.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-105 transition-transform">
                  <Github size={20} />
                </a>
              )}
              {data.socialLinks?.twitter && (
                <a
                  href={data.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-105 transition-transform">
                  <Twitter size={20} />
                </a>
              )}
            </div>

            <Button>Follow</Button>
          </>
        ) : null}
      </motion.div>
    </div>
  );
}
