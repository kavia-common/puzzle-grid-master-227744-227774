#!/bin/bash
cd /home/kavia/workspace/code-generation/puzzle-grid-master-227744-227774/puzzle_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

