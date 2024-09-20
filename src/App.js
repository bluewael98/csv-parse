import React, { useState } from "react";
import Papa from "papaparse"; // CSV parsing library
import { saveAs } from "file-saver"; // File download library

function App() {
  const [csvData, setCsvData] = useState(null);

   // Function to handle file input and parse CSV using PapaParse
   const handleFileInput = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true, // Treat first row as header
      complete: (results) => {
        setCsvData(results.data);
      },
    });
  };

  // Function to roll up CSV data by company name and calculate all scores, including Listings with Multiple Posts
  const rollupByCompanyName = () => {
    if (!csvData) return;

    const companyCounts = {};

    // Extract company name and sum all required columns, and count occurrences
    csvData.forEach((row) => {
      const companyName = row["Associated Company Name"];  // Matching on company name
      const totalPassed = parseFloat(row["Total Passed"]) || 0;
      const totalResults = parseFloat(row["Total Results"]) || 0;

      // Additional columns
      const presencePassed = parseFloat(row["Presence Tests Passed"]) || 0;
      const presenceTaken = parseFloat(row["Presence Tests Taken"]) || 0;

      const reputationPassed = parseFloat(row["Reputation Tests Passed"]) || 0;
      const reputationTaken = parseFloat(row["Reputation Total Tests Taken"]) || 0;

      const marketingPassed = parseFloat(row["Marketing Tests Passed"]) || 0;
      const marketingTaken = parseFloat(row["Marketing Total Tests Taken"]) || 0;

      const messagingPassed = parseFloat(row["Messaging Tests Passed"]) || 0;
      const messagingTaken = parseFloat(row["Messaging Tests Taken"]) || 0;

      const isClaimed = parseFloat(row["Is Claimed"]) || 0; // "Is Claimed" for Verified
      const hasUtmCodes = parseFloat(row["Has Website Utm Codes"]) || 0; // Tracking column
      const hasPhoneNumber = parseFloat(row["Has Phone Number"]) || 0; // Phone Number column
      const hasWebsiteUrl = parseFloat(row["Has Website Url"]) || 0; // Website URL column
      const hasReviewsHighTotal = parseFloat(row["Has Reviews High Total"]) || 0; // "Has Reviews High Total" for Low Review Count
      const hasAverageRating = parseFloat(row["Has Reviews Average Rating"]) || 0; // "Has Reviews Average Rating" for High Ratings
      const hasPosts = parseFloat(row["Has Posts"]) || 0; // "Has Posts" for Listings Posting
      const hasPostsMultiple = parseFloat(row["Has Posts Multiple"]) || 0; // "Has Posts Multiple" for Listings with Multiple Posts

      if (companyName) {
        // Initialize if company not seen before
        if (!companyCounts[companyName]) {
          companyCounts[companyName] = {
            count: 0,
            totalPassedSum: 0,
            totalResultsSum: 0,
            presencePassedSum: 0,
            presenceTakenSum: 0,
            reputationPassedSum: 0,
            reputationTakenSum: 0,
            marketingPassedSum: 0,
            marketingTakenSum: 0,
            messagingPassedSum: 0,
            messagingTakenSum: 0,
            verifiedSum: 0, // Sum of "Is Claimed"
            trackingSum: 0, // Sum of "Has Website Utm Codes"
            phoneNumberSum: 0, // Sum of "Has Phone Number"
            websiteUrlSum: 0, // Sum of "Has Website Url"
            reviewsHighTotalSum: 0, // Sum of "Has Reviews High Total"
            highRatingsSum: 0, // Sum of "Has Reviews Average Rating"
            listingsPostingSum: 0, // Sum of "Has Posts" for Listings Posting
            listingsMultiplePostsSum: 0 // Sum of "Has Posts Multiple" for Listings with Multiple Posts
          };
        }

        // Increment count and sum all metrics
        companyCounts[companyName].count += 1;
        companyCounts[companyName].totalPassedSum += totalPassed;
        companyCounts[companyName].totalResultsSum += totalResults;
        companyCounts[companyName].presencePassedSum += presencePassed;
        companyCounts[companyName].presenceTakenSum += presenceTaken;
        companyCounts[companyName].reputationPassedSum += reputationPassed;
        companyCounts[companyName].reputationTakenSum += reputationTaken;
        companyCounts[companyName].marketingPassedSum += marketingPassed;
        companyCounts[companyName].marketingTakenSum += marketingTaken;
        companyCounts[companyName].messagingPassedSum += messagingPassed;
        companyCounts[companyName].messagingTakenSum += messagingTaken;
        companyCounts[companyName].verifiedSum += isClaimed; // Sum "Is Claimed" for Verified
        companyCounts[companyName].trackingSum += hasUtmCodes; // Sum "Has Website Utm Codes"
        companyCounts[companyName].phoneNumberSum += hasPhoneNumber; // Sum "Has Phone Number"
        companyCounts[companyName].websiteUrlSum += hasWebsiteUrl; // Sum "Has Website Url"
        companyCounts[companyName].reviewsHighTotalSum += hasReviewsHighTotal; // Sum "Has Reviews High Total"
        companyCounts[companyName].highRatingsSum += hasAverageRating; // Sum "Has Reviews Average Rating" for High Ratings
        companyCounts[companyName].listingsPostingSum += hasPosts; // Sum "Has Posts" for Listings Posting
        companyCounts[companyName].listingsMultiplePostsSum += hasPostsMultiple; // Sum "Has Posts Multiple" for Listings with Multiple Posts
      }
    });

    // Create the final data with Company Name, Count, and the additional columns
    const finalData = Object.entries(companyCounts).map(([companyName, sums]) => ({
      "Company Name": companyName,
      Count: sums.count,
      "Audit Score": sums.totalResultsSum > 0 ? (sums.totalPassedSum / sums.totalResultsSum).toFixed(2) : 0,
      Presence: sums.presenceTakenSum > 0 ? (sums.presencePassedSum / sums.presenceTakenSum).toFixed(2) : 0,
      Reputation: sums.reputationTakenSum > 0 ? (sums.reputationPassedSum / sums.reputationTakenSum).toFixed(2) : 0,
      Marketing: sums.marketingTakenSum > 0 ? (sums.marketingPassedSum / sums.marketingTakenSum).toFixed(2) : 0,
      Messaging: sums.messagingTakenSum > 0 ? (sums.messagingPassedSum / sums.messagingTakenSum).toFixed(2) : 0,
      "Company Name 1": companyName, // Duplicated company name with "1"
      "Count 1": sums.count, // Duplicated count with "1"
      "Presence 1": sums.presenceTakenSum > 0 ? (sums.presencePassedSum / sums.presenceTakenSum).toFixed(2) : 0,
      Verified: sums.verifiedSum, // Sum of "Is Claimed"
      Tracking: sums.trackingSum, // Sum of "Has Website Utm Codes"
      "Phone Number": sums.phoneNumberSum, // Sum of "Has Phone Number"
      "Website URL": sums.websiteUrlSum, // Sum of "Has Website Url"
      "Company Name 2": companyName, // Duplicated company name again with "2"
      "Count 2": sums.count, // Duplicated count again with "2"
      "Reputation 2": sums.reputationTakenSum > 0 ? (sums.reputationPassedSum / sums.reputationTakenSum).toFixed(2) : 0,
      "Low Review Count": sums.count - sums.reviewsHighTotalSum, // Low Review Count calculation
      "High Ratings": sums.highRatingsSum, // High Ratings calculation
      "Company Name 3": companyName, // Duplicated company name with "3"
      "Count 3": sums.count, // Duplicated count with "3"
      "Marketing 2": sums.marketingTakenSum > 0 ? (sums.marketingPassedSum / sums.marketingTakenSum).toFixed(2) : 0,
      "Listings Posting": sums.listingsPostingSum, // Listings Posting calculation
      "Listings Not Posting": sums.count - sums.listingsPostingSum, // Listings Not Posting calculation
      "Listings with Multiple Posts": sums.listingsMultiplePostsSum // Listings with Multiple Posts calculation
    }));

    // Convert the result back to CSV and trigger download
    const csv = Papa.unparse(finalData); // Converts JSON back to CSV
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "rolled-up-company-scores.csv"); // Trigger file download
  };

  return (
    <div className="App">
      <h1>CSV Company Rollup</h1>
      <input type="file" accept=".csv" onChange={handleFileInput} />
      <button onClick={rollupByCompanyName}>Process & Download CSV</button>
    </div>
  );
}

export default App;
